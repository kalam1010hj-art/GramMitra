from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):

    def create_user(self, phone, full_name, password=None, **extra_fields):

        if not phone:
            raise ValueError("Phone number is required")

        if not full_name:
            raise ValueError("Full name is required")

        user = self.model(
            phone=phone,
            full_name=full_name,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, phone, full_name, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "admin")

        return self.create_user(
            phone=phone,
            full_name=full_name,
            password=password,
            **extra_fields
        )