from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User
from .forms import (
    CustomUserCreationForm,
    CustomUserChangeForm,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    model = User

    list_display = (
        "username",
        "phone",
        "full_name",
        "role",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "role",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "username",
        "phone",
        "full_name",
        "email",
    )

    ordering = ("username",)

    fieldsets = (
        (None, {
            "fields": (
                "username",
                "phone",
                "password",
            )
        }),

        ("Personal Information", {
            "fields": (
                "full_name",
                "email",
                "profile_image",
                "role",
                "ward_number",
            )
        }),

        ("Permissions", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),

        ("Important Dates", {
            "fields": (
                "last_login",
            )
        }),
    )

    readonly_fields = (
        "last_login",
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username",
                "phone",
                "full_name",
                "email",
                "role",
                "password1",
                "password2",
                "is_staff",
                "is_superuser",
            ),
        }),
    )