from rest_framework.permissions import BasePermission


class GrievancePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "official":
            return obj.assigned_to_id == user.pk
        return user.role == "admin" or obj.user_id == user.pk
