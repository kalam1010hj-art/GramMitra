from django.core.cache import cache
from rest_framework.test import APITestCase
from accounts.models import User


class AccountsTest(APITestCase):
    def setUp(self):
        cache.clear()

    def test_register_login_profile_password_logout(self):
        data = {
            "phone": "9100000001",
            "full_name": "Resident",
            "password": "a-Long-Test-Phrase!2",
            "role": "admin",
        }
        response = self.client.post("/accounts/register", data)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["role"], "resident")
        self.assertNotIn("password", response.data)
        user = User.objects.get(phone=data["phone"])
        self.assertTrue(user.check_password(data["password"]))
        self.assertEqual(
            self.client.post(
                "/accounts/login", {"phone": user.phone, "password": "wrong"}
            ).status_code,
            401,
        )
        login = self.client.post("/accounts/login", data)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + login.data["token"])
        self.assertEqual(
            self.client.patch(
                "/accounts/profileEdit", {"full_name": "Updated", "role": "official"}
            ).data["role"],
            "resident",
        )
        self.assertEqual(self.client.get("/dashboard/").status_code, 403)
        self.assertEqual(self.client.get("/accounts/users").status_code, 403)
        self.assertEqual(
            self.client.post(
                "/accounts/password",
                {
                    "old_password": data["password"],
                    "new_password": "better-Test-Phrase!33",
                },
            ).status_code,
            204,
        )
        self.assertEqual(self.client.get("/accounts/profileEdit").status_code, 401)
        self.client.credentials()
        login = self.client.post(
            "/accounts/login",
            {"phone": user.phone, "password": "better-Test-Phrase!33"},
        )
        self.client.credentials(HTTP_AUTHORIZATION="Token " + login.data["token"])
        self.assertEqual(self.client.post("/accounts/logout").status_code, 204)
        self.assertEqual(self.client.get("/accounts/profileEdit").status_code, 401)

    def test_login_throttled(self):
        for _ in range(12):
            self.client.post(
                "/accounts/login", {"username": "absent", "password": "test"}
            )
        self.assertEqual(
            self.client.post(
                "/accounts/login", {"username": "absent", "password": "test"}
            ).status_code,
            429,
        )

    def test_admin_accounts(self):
        admin = User.objects.create_user(
            "admin", "Admin", phone="9111111111", role="admin"
        )
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.get("/dashboard/").status_code, 200)
        row = self.client.post(
            "/accounts/users",
            {
                "phone": "9222222222",
                "full_name": "Village staff",
                "password": "Staff-phrase!552",
            },
        )
        self.assertEqual(row.status_code, 201, row.data)
        self.assertEqual(row.data["role"], "official")
        self.assertEqual(
            self.client.patch(
                "/accounts/users/" + str(row.data["id"]), {"is_active": False}
            ).data["is_active"],
            False,
        )

    def test_expired_token_requires_login_and_rotates(self):
        from datetime import timedelta
        from django.utils import timezone
        from rest_framework.authtoken.models import Token

        user = User.objects.create_user(
            "legacy", "Legacy", phone="9222222224", password="sample-Test-234!"
        )
        token = Token.objects.create(user=user)
        Token.objects.filter(pk=token.pk).update(
            created=timezone.now() - timedelta(days=31)
        )
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
        self.assertEqual(self.client.get("/accounts/profileEdit").status_code, 401)
        self.client.credentials()
        response = self.client.post(
            "/accounts/login", {"username": "legacy", "password": "sample-Test-234!"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.data["token"], token.key)
