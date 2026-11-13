from rest_framework.permissions import BasePermission

class IsAdminorReadonly(BasePermission):

    def has_permission(self, request, view):
        if request.method in ["PUT","PATCH","DELETE","POST"]:
            if request.user.is_staff:
                return True
            else:
                return False
        return True