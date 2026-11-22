from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Grievance


class GrievanceSubmissionTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.resident = user_model.objects.create_user(
            username="resident_one",
            full_name="Resident One",
            phone="9999999001",
            email="resident1@example.com",
            password="TestPassword123!",
        )
        self.another_resident = user_model.objects.create_user(
            username="resident_two",
            full_name="Resident Two",
            phone="9999999002",
            email="resident2@example.com",
            password="TestPassword123!",
        )
        self.url = "/grievances/"

    def grievance_data(self):
        return {
            "title": "No drinking water",
            "description": "No drinking water supplied for three days.",
            "category": "WATER",
            "location": "Near Government School",
            "priority": "MEDIUM",
        }

    def test_authenticated_submission_uses_request_user_without_user_field(self):
        token = Token.objects.create(user=self.resident)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.post(self.url, self.grievance_data(), format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        grievance = Grievance.objects.get(pk=response.data["id"])
        self.assertEqual(grievance.user_id, self.resident.pk)

    def test_submission_cannot_impersonate_another_resident(self):
        self.client.force_authenticate(user=self.resident)
        payload = {**self.grievance_data(), "user": self.another_resident.pk}

        response = self.client.post(self.url, payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        grievance = Grievance.objects.get(pk=response.data["id"])
        self.assertEqual(grievance.user_id, self.resident.pk)

    def test_anonymous_submission_is_rejected(self):
        response = self.client.post(self.url, self.grievance_data(), format="multipart")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Grievance.objects.exists())

    def test_anonymous_list_requires_login(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
