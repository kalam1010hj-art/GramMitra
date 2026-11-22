from datetime import timedelta

from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


def expired(token):
    return token.created + timedelta(days=30) <= timezone.now()


class VillageTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if expired(token):
            raise AuthenticationFailed("Session expired. Sign in again.")
        return user, token
