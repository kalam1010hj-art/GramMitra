from django.db import transaction
from django.db.models import Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from config.api import Pages
from .permission import GrievancePermissions
from .serializers import (
    GrievanceSerializer,
    GrievanceDetailsSerializer,
    ProgressSerializer,
)
from ..models import Grievance, GrievanceUpdates


def visible(user):
    rows = Grievance.objects.all()
    if user.role == "official":
        return rows.filter(assigned_to=user)
    if user.role == "admin":
        return rows
    return rows.filter(user=user)


class GrievanceView(APIView):
    permission_classes = [GrievancePermissions]

    def get(self, request):
        rows = (
            visible(request.user)
            .select_related("assigned_to")
            .order_by("-created_at", "-pk")
        )
        params = request.query_params
        for key in ("category", "status", "assigned_to"):
            if params.get(key):
                if key == "assigned_to" and not params[key].isdigit():
                    raise ValidationError({"assigned_to": "Enter an official ID."})
                rows = rows.filter(**{key: params[key]})
        if params.get("search"):
            term = params["search"]
            rows = rows.filter(
                Q(title__icontains=term)
                | Q(location__icontains=term)
                | Q(description__icontains=term)
            )
        pages = Pages()
        return pages.get_paginated_response(
            GrievanceSerializer(pages.paginate_queryset(rows, request), many=True).data
        )

    @transaction.atomic
    def post(self, request):
        if request.user.role != "resident":
            raise PermissionDenied("A resident account is required.")
        serializer = GrievanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        grievance = serializer.save(user=request.user)
        grievance.updates.create(
            updated_by=request.user,
            new_status=grievance.status,
            message="Grievance submitted.",
        )
        return Response(serializer.data, status=201)


def update_progress(grievance, data, user):
    form = ProgressSerializer(data=data)
    form.is_valid(raise_exception=True)
    values = form.validated_data
    old = grievance.status
    status = values.get("new_status", old)
    if user.role != "admin" and {"priority", "assigned_to"}.intersection(data):
        raise PermissionDenied()
    transitions = {
        "PENDING": {"IN_PROGRESS", "REJECTED"},
        "IN_PROGRESS": {"RESOLVED", "REJECTED"},
    }
    if old != status and status not in transitions.get(old, set()):
        raise ValidationError(
            {"new_status": "Invalid transition from the current status."}
        )
    if (
        status in {"REJECTED", "RESOLVED"}
        and old != status
        and not values.get("resolution_note")
    ):
        raise ValidationError({"resolution_note": "Explain the outcome."})
    messages = []
    if "assigned_to" in values and values["assigned_to"] != grievance.assigned_to:
        grievance.assigned_at = timezone.now() if values["assigned_to"] else None
    for key in ("assigned_to", "priority", "resolution_note"):
        if key in values and getattr(grievance, key) != values[key]:
            setattr(grievance, key, values[key])
            messages.append(
                f"{key.replace('_', ' ').capitalize()}: {values[key] or 'Unassigned'}"
            )
    if values.get("message"):
        messages.append(values["message"])
    if old == status and not messages:
        raise ValidationError({"message": "Add an update or change a field."})
    grievance.status = status
    if status == "RESOLVED" and old != status:
        grievance.resolved_at = timezone.now()
    grievance.save()
    grievance.updates.create(
        updated_by=user, old_status=old, new_status=status, message=" · ".join(messages)
    )


class GrievanceDetailsView(APIView):
    permission_classes = [GrievancePermissions]

    def get(self, request, pk):
        rows = (
            visible(request.user)
            .select_related("assigned_to")
            .prefetch_related(
                Prefetch(
                    "updates",
                    queryset=GrievanceUpdates.objects.select_related(
                        "updated_by"
                    ).order_by("created_at", "pk"),
                )
            )
        )
        obj = get_object_or_404(rows, pk=pk)
        self.check_object_permissions(request, obj)
        return Response(
            GrievanceDetailsSerializer(obj, context={"request": request}).data
        )

    @transaction.atomic
    def patch(self, request, pk):
        obj = get_object_or_404(visible(request.user).select_for_update(), pk=pk)
        self.check_object_permissions(request, obj)
        if request.user.role == "resident":
            if obj.status != "PENDING":
                raise PermissionDenied()
            if "priority" in request.data and request.data["priority"] != obj.priority:
                raise PermissionDenied("Staff manage priority after submission.")
            form = GrievanceSerializer(obj, data=request.data, partial=True)
            form.is_valid(raise_exception=True)
            form.save()
        else:
            update_progress(obj, request.data, request.user)
        return self.get(request, pk)


class GrievanceUpdateView(GrievanceDetailsView):
    http_method_names = ["post", "options"]

    def post(self, request):
        if request.user.role not in {"admin", "official"}:
            raise PermissionDenied()
        pk = request.data.get("grievance")
        if not str(pk).isdigit():
            raise ValidationError({"grievance": "Enter a grievance ID."})
        return self.patch(request, pk)


class AttachmentView(APIView):
    permission_classes = [GrievancePermissions]

    def get(self, request, pk):
        from django.http import FileResponse, Http404
        from django.core.files.storage import default_storage
        from mimetypes import guess_type

        obj = get_object_or_404(visible(request.user), pk=pk)
        self.check_object_permissions(request, obj)
        if not obj.image:
            raise Http404()
        try:
            source = obj.image.open("rb")
        except FileNotFoundError:
            # Pre-migration uploads used the default storage.
            try:
                source = default_storage.open(obj.image.name, "rb")
            except FileNotFoundError:
                raise Http404()
        mime = guess_type(obj.image.name)[0] or "image/jpeg"
        response = FileResponse(source, content_type=mime)
        response["Cache-Control"] = "private, no-store"
        return response
