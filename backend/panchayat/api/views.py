from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import PanchayatSerializer
from ..models import Panchayat

class PanchayatView(APIView):

    def get(self,request):
        panchayat = Panchayat.objects.all()
        serializer = PanchayatSerializer(panchayat,many=True)
        return Response(serializer.data)

    

class PanchayatDetailsView(APIView):

    def put(self,request,pk):
        panchayat = Panchayat.objects.get(id=pk)
        serializer = PanchayatSerializer(panchayat,request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"error":serializer.errors})

    def patch(self,request,pk):
        panchayat = Panchayat.objects.get(id=pk)
        serializer = PanchayatSerializer(panchayat,request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"error":serializer.errors})