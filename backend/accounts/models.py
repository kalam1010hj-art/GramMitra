from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("resident", "Resident"),
        ("official", "Panchayat Official"),
        ("admin", "Admin"),
    )

    phone = models.CharField(max_length=15, unique=True)
    profile_image = models.ImageField(upload_to="profiles/",blank=True,null=True)
    email = models.EmailField(unique=True,blank=True)
    username = models.CharField(unique=True,max_length=150)

    full_name = models.CharField(max_length=150)



    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="resident"
    )

    ward_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.full_name