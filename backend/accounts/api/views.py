from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from ..models import User
from ..authentication import expired
from .serializers import RegisterSerializer, UserSerializer


class LoginView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        phone = request.data.get("phone")
        name = request.data.get("username")
        if phone:
            name = (
                User.objects.filter(phone=phone)
                .values_list("username", flat=True)
                .first()
            )
        user = authenticate(
            request, username=name or "", password=request.data.get("password")
        )
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=401)
        with transaction.atomic():
            # Serialize expiry rotation for simultaneous logins from the same account.
            User.objects.select_for_update().get(pk=user.pk)
            token, _ = Token.objects.get_or_create(user=user)
            if expired(token):
                token.delete()
                token = Token.objects.create(user=user)
        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "token": token.key,
            }
        )


class RegisterView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        form = RegisterSerializer(data=request.data)
        form.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = form.save()
        except IntegrityError:
            raise ValidationError("Unable to register with these details.")
        return Response(
            UserSerializer(user, context={"request": request}).data, status=201
        )


class ProfileEditView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        form = UserSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        form.is_valid(raise_exception=True)
        form.save()
        return Response(form.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        return Response(status=204)


class PasswordView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @transaction.atomic
    def post(self, request):
        user = request.user
        if not user.check_password(request.data.get("old_password", "")):
            raise ValidationError({"old_password": "Incorrect current password."})
        password = request.data.get("new_password")
        if not isinstance(password, str) or not password:
            raise ValidationError({"new_password": "Enter a new password."})
        try:
            validate_password(password, user)
        except DjangoValidationError as exc:
            raise ValidationError({"new_password": exc.messages})
        user.set_password(password)
        user.save(update_fields=["password"])
        Token.objects.filter(user=user).delete()
        return Response(status=204)
