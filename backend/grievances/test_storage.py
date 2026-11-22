from io import BytesIO
from unittest.mock import patch

from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings

from accounts.models import User
from grievances.models import Grievance
from grievances.storage import AuthenticatedImages


class StorageTests(SimpleTestCase):
    @patch("grievances.storage.cloudinary.utils.private_download_url")
    @patch("grievances.storage.cloudinary.uploader.upload")
    def test_original_format_and_authenticated_delivery(self, upload, signed):
        upload.return_value = {"public_id": "grammitra-private/id", "format": "webp"}
        storage = AuthenticatedImages()
        name = storage._save("evidence.webp", BytesIO(b"example"))
        self.assertEqual(upload.call_args.kwargs["type"], "authenticated")
        storage.url(name)
        self.assertEqual(signed.call_args.args, ("grammitra-private/id", "webp"))
        self.assertEqual(signed.call_args.kwargs["type"], "authenticated")


class LegacyEvidenceTests(TestCase):
    @override_settings(
        CLOUDINARY_STORAGE={
            "CLOUD_NAME": "test",
            "API_KEY": "test",
            "API_SECRET": "test",
        }
    )
    @patch("cloudinary.uploader.rename")
    @patch("cloudinary.api.resource")
    def test_preview_and_resumption(self, resource, rename):
        user = User.objects.create_user("test", "Test", phone="9991112233")
        row = Grievance.objects.create(
            user=user, title="Issue", category="WATER", image="media/grievances/legacy"
        )
        call_command("privatize_grievance_media", verbosity=0)
        resource.assert_not_called()
        resource.return_value = {
            "public_id": "grammitra-private/recovered",
            "format": "png",
        }
        call_command("privatize_grievance_media", apply=True)
        row.refresh_from_db()
        self.assertEqual(row.image.name, "grammitra-private/recovered.png")
        call_command("privatize_grievance_media", apply=True)
        rename.assert_not_called()
        self.assertEqual(resource.call_count, 1)
