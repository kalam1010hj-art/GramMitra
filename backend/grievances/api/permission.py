from rest_framework.permissions import BasePermission,SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (request.user.is_authenticated and request.user.role in ["admin","official"])

class GrievancePermissions(BasePermission):

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (request.user.is_authenticated)
    

    def has_object_permission(self, request, view, obj):


        if request.method in SAFE_METHODS:
            return (is_owner or is_official)
        user = request.user

        if user.role == "admin":
            return True
        
        is_owner = user.id == obj.user_id
        is_official = user.role == "official"

        is_assigned_official = (
            user.role == "official"
            and obj.assigned_to_id == user.id
        )

        

        if request.method in ["PUT","PATCH"]:

            if is_assigned_official:
                return True
            if is_owner and obj.status == "PENDING":
                return True
            return False

        return False

class GrievanceUpdatePermissions(BasePermission):
    message = "You do not have permission to perform this action."
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if (user.is_authenticated):
            is_official = request.user.role == "official"
            is_admin    = request.user.role == "admin"
            return (is_official or is_admin)
        return False
    # only Assigned official and Admin has permission on the object
    def has_object_permission(self, request, view, obj):

        if request.method in SAFE_METHODS:
            return True
        user = request.user
    
        
        is_assigned_official = ( user.role == "official" and user.id == obj.grievance.assigned_to_id)
        is_admin    = request.user.role == "admin"

        if(is_assigned_official or is_admin):
            return True
        
        return False
    
                
        



        