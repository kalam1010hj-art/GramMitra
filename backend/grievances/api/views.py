from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from ..models import Grievance,GrievanceUpdates
from django.shortcuts import get_object_or_404
from .serializers import GrievanceSerializer,GrievanceUpdateSerializer,GrievanceDetailsSerializer
from .permission import IsAdminOrReadOnly,GrievancePermissions,GrievanceUpdatePermissions

class GrievanceView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self,request):
        grievances = Grievance.objects.all()
        serializer = GrievanceSerializer(grievances,many = True)
        return Response(serializer.data)

    def post(self,request):
        serializer = GrievanceSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    

class GrievanceDetailsView(APIView):

   permission_classes = [GrievancePermissions]

   def get(self,request,pk):
       grievance = Grievance.objects.get(id=pk)
       serializer = GrievanceDetailsSerializer(grievance)
       return Response(serializer.data)
       

   

   def patch(self,request,pk):
       grievance = Grievance.objects.get(id=pk)
       self.check_object_permissions(request, grievance)
       serializer = GrievanceSerializer(grievance,data=request.data,partial = True)
       if serializer.is_valid():
           serializer.save()
           return Response(serializer.data)
       return Response(serializer.errors,status=400)


# view for handling Grievance updates these updates are only allowed for assigned official and admin to update ,delete  and post

class GrievanceUpdateView(APIView):
    permission_classes = [GrievanceUpdatePermissions]
    
    def post(self,request):
    
        grievance = get_object_or_404(Grievance,id=request.data.get("grievance"))
        user = request.user
        if (user.role != "admin" and grievance.assigned_to_id != user.id):
          raise PermissionDenied(
        "You are not assigned to this grievance."
    )
        serializer = GrievanceUpdateSerializer(data = request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"errors":serializer.errors,"detail":"something went wrong"},status=400)


class GrievanceUpdateDetailsView(APIView):
    permission_classes = [GrievanceUpdatePermissions]
    def patch(self,request,pk):
        grievanceUpdate = GrievanceUpdates.objects.get(id=pk)
        serializer = GrievanceUpdateSerializer(grievanceUpdate,data = request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)

    def delete(self,request,pk):
        grievanceUpdate = GrievanceUpdates.objects.get(id=pk)
        grievanceUpdate.delete()
        return Response({"message":"Deleted successFully"},status=201)


