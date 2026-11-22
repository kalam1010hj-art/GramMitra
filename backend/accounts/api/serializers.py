from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from config.uploads import validate_image
from ..models import User


class UserSerializer(serializers.ModelSerializer):
    validate_profile_image = staticmethod(validate_image)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "profile_image",
            "phone",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "phone",
            "role",
            "is_active",
            "is_staff",
            "created_at",
        ]

    def validate_email(self, value):
        return value or None


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(
        write_only=True, required=False, trim_whitespace=False
    )
    phone = serializers.RegexField(r"^\+?[0-9]{10,15}$", max_length=15)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "full_name",
            "password",
            "confirm_password",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "trim_whitespace": False},
            "username": {"required": False},
        }

    def validate(self, attrs):
        attrs.setdefault("username", attrs["phone"])
        if (
            attrs["username"].lstrip("+").isdigit()
            and attrs["username"] != attrs["phone"]
        ):
            raise serializers.ValidationError(
                {"username": "Use your own phone number or a non-numeric username."}
            )
        if (
            User.objects.filter(phone=attrs["phone"]).exists()
            or User.objects.filter(username=attrs["username"]).exists()
        ):
            raise serializers.ValidationError("Unable to register with these details.")
        if attrs.pop("confirm_password", attrs["password"]) != attrs["password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        validate_password(
            attrs["password"],
            User(username=attrs["username"], full_name=attrs["full_name"]),
        )
        attrs["email"] = attrs.get("email") or None
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
