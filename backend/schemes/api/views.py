from rest_framework.views import APIView
from rest_framework.response import Response
from .permisions import IsAdminorReadonly
from rest_framework.permissions import IsAuthenticated
from .serializers import SchemeSerializer
from ..models import GovernmentScheme


class SchemeView(APIView):
    permission_classes = [IsAdminorReadonly]
    def get(self,request):
        schemes = GovernmentScheme.objects.all()
        serializer = SchemeSerializer(schemes,many=True)
        print(request.user)
        return Response(serializer.data)

    def post(self,request):
        serializer = SchemeSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"error":serializer.errors})
    
    
class SchemeDetailsView(APIView):
    permission_classes = [IsAdminorReadonly]
    def get(self,request,pk):
        try:
            scheme = GovernmentScheme.objects.get(id=pk)
            serializer = SchemeSerializer(scheme)
            return Response(serializer.data)
        except GovernmentScheme.DoesNotExist:
            return Response({"error":"not found"},status=404)

    def put(self,request,pk):
        scheme = GovernmentScheme.objects.get(id =pk)
        serializer = SchemeSerializer(scheme,data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"error":serializer.errors})

    def patch(self,request,pk):
        scheme = GovernmentScheme.objects.get(id =pk)
        serializer = SchemeSerializer(scheme,data = request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"error":serializer.errors})
    def delete(self,request,pk):
        scheme = GovernmentScheme.objects.get(id=pk)
        scheme.delete()
        return Response({"Message":"sucessfully deleted!"})
    