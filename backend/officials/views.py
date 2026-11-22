from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.api.serializers import RegisterSerializer, UserSerializer
from accounts.models import User
from config.api import Collection, Detail, AdminOnly, Pages
from config.uploads import validate_image
from grievances.api.views import visible
from grievances.models import Grievance
from notices.models import Notice
from schemes.models import GovernmentScheme
from utilites.models import UtilitySchedule
from .models import DirectoryEntry


class DirectorySerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(default=True)
    validate_profile_image = staticmethod(validate_image)

    class Meta:
        model = DirectoryEntry
        fields = [
            "id",
            "full_name",
            "designation",
            "department",
            "office",
            "public_contact",
            "profile_image",
            "is_active",
        ]


class Directory:
    serializer = DirectorySerializer

    def records(self, request):
        rows = super().records(request)
        if (
            getattr(request.user, "role", None) != "admin"
            or request.query_params.get("manage") != "1"
        ):
            rows = rows.filter(is_active=True)
        return rows.filter(full_name__icontains=request.query_params.get("search", ""))


class DirectoryView(Directory, Collection):
    pass


class EntryView(Directory, Detail):
    pass


class Dashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in {"official", "admin"}:
            raise PermissionDenied()
        rows = visible(request.user)
        counts = rows.aggregate(
            total=Count("id"),
            **{
                status.lower(): Count("id", filter=Q(status=status))
                for status in Grievance.Status.values
            },
        )
        if request.user.role == "admin":
            now = timezone.now()
            counts.update(
                User.objects.aggregate(
                    residents=Count("id", filter=Q(role="resident")),
                    officials=Count("id", filter=Q(role="official")),
                )
            )
            counts.update(
                schedules=UtilitySchedule.objects.count(),
                notices=Notice.objects.filter(is_published=True)
                .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))
                .count(),
                schemes=GovernmentScheme.objects.filter(is_active=True)
                .filter(Q(start_date__isnull=True) | Q(start_date__lte=now))
                .filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
                .count(),
            )
        recent = rows.filter(assigned_at__isnull=False).order_by("-assigned_at", "-pk")[
            :5
        ]
        counts["recent_assignments"] = list(recent.values("id", "title", "assigned_at"))
        return Response(counts)


class UsersView(APIView):
    permission_classes = [AdminOnly]

    def get(self, request):
        term = request.query_params.get("search", "")
        rows = User.objects.filter(
            Q(full_name__icontains=term) | Q(phone__icontains=term)
        ).order_by("full_name", "id")
        if request.query_params.get("role"):
            rows = rows.filter(role=request.query_params["role"])
        pages = Pages()
        return pages.get_paginated_response(
            UserSerializer(pages.paginate_queryset(rows, request), many=True).data
        )

    def post(self, request):
        form = RegisterSerializer(data=request.data)
        form.is_valid(raise_exception=True)
        return Response(UserSerializer(form.save(role="official")).data, status=201)


class AccountAccess(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role", "is_active"]


class UserAccessView(APIView):
    permission_classes = [AdminOnly]

    @transaction.atomic
    def patch(self, request, pk):
        obj = get_object_or_404(User.objects.select_for_update(), pk=pk)
        if obj == request.user or obj.is_superuser:
            raise ValidationError("This administrator account is protected.")
        form = AccountAccess(obj, data=request.data, partial=True)
        form.is_valid(raise_exception=True)
        if obj.assigned_grievances.exists() and (
            form.validated_data.get("role", obj.role) != "official"
            or not form.validated_data.get("is_active", obj.is_active)
        ):
            raise ValidationError("Reassign this official's grievances first.")
        form.save()
        from rest_framework.authtoken.models import Token

        Token.objects.filter(user=obj).delete()
        return Response(UserSerializer(obj).data)
