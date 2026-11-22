from io import BytesIO
from tempfile import TemporaryDirectory
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase
from accounts.models import User
from .models import Grievance


class LifecycleTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        def account(name, role, phone):
            return User.objects.create_user(name, name, phone=phone, role=role)

        cls.a = account("first", "resident", "9100000001")
        cls.b = account("second", "resident", "9100000002")
        cls.official = account("official", "official", "9100000003")
        cls.other = account("other", "official", "9100000004")
        cls.admin = account("admin", "admin", "9100000005")

    def create_grievance(self, **extra):
        self.client.force_authenticate(self.a)
        data = {
            "title": "Supply stopped",
            "category": "WATER",
            "description": "At the school",
        }
        response = self.client.post("/grievances/", {**data, **extra})
        self.assertEqual(response.status_code, 201, response.data)
        return Grievance.objects.get(pk=response.data["id"])

    def test_submission_and_private_list_detail(self):
        row = self.create_grievance(
            user=self.b.pk, status="RESOLVED", assigned_to=self.official.pk
        )
        self.assertEqual(
            (row.user, row.status, row.assigned_to), (self.a, "PENDING", None)
        )
        for user in [self.b, self.official]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get("/grievances/").data["count"], 0)
            self.assertEqual(self.client.get(f"/grievances/{row.pk}").status_code, 404)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/grievances/").status_code, 401)

    def test_complete_lifecycle(self):
        row = self.create_grievance()
        url = f"/grievances/{row.pk}"
        self.client.force_authenticate(self.admin)
        self.assertEqual(
            self.client.patch(url, {"assigned_to": self.official.pk}).status_code, 200
        )
        self.client.force_authenticate(self.other)
        self.assertEqual(
            self.client.post(
                "/grievances/post-update",
                {"grievance": row.pk, "new_status": "IN_PROGRESS"},
            ).status_code,
            404,
        )
        self.client.force_authenticate(self.official)
        self.assertEqual(self.client.patch(url, {"priority": "HIGH"}).status_code, 403)
        self.assertEqual(
            self.client.patch(url, {"new_status": "RESOLVED"}).status_code, 400
        )
        response = self.client.post(
            "/grievances/post-update",
            {"grievance": row.pk, "new_status": "IN_PROGRESS", "updated_by": self.b.pk},
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(
            self.client.patch(url, {"new_status": "RESOLVED"}).status_code, 400
        )
        response = self.client.patch(
            url, {"new_status": "RESOLVED", "resolution_note": "Pipe repaired"}
        )
        self.assertIsNotNone(response.data["resolved_at"])
        self.assertEqual(
            response.data["updates"][-1]["updated_by"]["id"], self.official.pk
        )
        self.assertEqual(row.updates.count(), 4)

    def test_bad_payload(self):
        self.client.force_authenticate(self.a)
        self.assertEqual(
            self.client.post("/grievances/", {"title": ""}).status_code, 400
        )
        self.assertEqual(
            self.client.post("/grievances/post-update", {"grievance": 100}).status_code,
            403,
        )

    def test_private_image(self):
        image = BytesIO()
        Image.new("RGB", (2, 2)).save(image, "PNG")
        with TemporaryDirectory() as directory:
            from django.core.files.storage import FileSystemStorage
            from unittest.mock import patch

            with patch.object(
                Grievance._meta.get_field("image"),
                "storage",
                FileSystemStorage(directory),
            ):
                row = self.create_grievance(
                    image=SimpleUploadedFile("photo.png", image.getvalue(), "image/png")
                )
                url = f"/grievances/{row.pk}/attachment"
                response = self.client.get(url)
                self.assertEqual(b"".join(response.streaming_content), image.getvalue())
                self.client.force_authenticate(self.b)
                self.assertEqual(self.client.get(url).status_code, 404)
