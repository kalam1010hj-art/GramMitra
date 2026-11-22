from rest_framework.test import APITestCase
from accounts.models import User


class CatalogTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            "admin", "Admin", role="admin", phone="9000000000"
        )

    def test_schedules(self):
        self.assertEqual(self.client.post("/utility/schedule", {}).status_code, 401)
        self.client.force_authenticate(self.admin)
        utility = self.client.post(
            "/utility/", {"name": "School tap", "utility_type": "WATER"}
        )
        slot = {
            "utility": utility.data["id"],
            "start_time": "06:00",
            "end_time": "08:00",
            "day": "MONDAY",
        }
        self.assertEqual(self.client.post("/utility/schedule", slot).status_code, 201)
        self.assertEqual(
            self.client.post("/utility/schedule", {**slot, "day": "DAILY"}).status_code,
            400,
        )
        self.assertEqual(
            self.client.post(
                "/utility/schedule", {**slot, "day": "TUESDAY"}
            ).status_code,
            201,
        )
        self.assertEqual(
            self.client.post(
                "/utility/schedule",
                {**slot, "start_time": "08:00", "end_time": "09:00"},
            ).status_code,
            201,
        )
        self.assertEqual(
            self.client.post(
                "/utility/schedule", {**slot, "end_time": "04:00"}
            ).status_code,
            400,
        )

    def test_public_visibility(self):
        self.client.force_authenticate(self.admin)
        notice = self.client.post(
            "/notices/",
            {"title": "Meeting", "description": "Office", "is_published": False},
        )
        self.assertEqual(notice.status_code, 201, notice.data)
        self.assertEqual(
            self.client.post(
                "/schemes/", {"name": "Past grant", "end_date": "2020-01-01T12:00:00Z"}
            ).status_code,
            201,
        )
        directory = self.client.post(
            "/officials/",
            {
                "full_name": "Public officer",
                "department": "Water",
                "designation": "Engineer",
            },
        )
        self.assertEqual(directory.status_code, 201)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/notices/").data, [])
        self.assertEqual(
            self.client.get("/notices/" + str(notice.data["id"])).status_code, 404
        )
        self.assertEqual(self.client.get("/schemes/").data, [])
        self.assertNotIn("phone", self.client.get("/officials/").data[0])
