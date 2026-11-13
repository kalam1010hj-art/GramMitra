from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Utility,UtilitySchedule
from schemes.api.permisions import IsAdminorReadonly
from .serializers import UtitlitySerializer,UtilityScheduleSerializer

class UtitlityView(APIView):
    permission_classes = [IsAdminorReadonly]
    def get(self,request):
        utilities = Utility.objects.all()
        serializer = UtitlitySerializer(utilities,many = True)
        return Response(serializer.data)

    def post(self,request):
        serializer = UtitlitySerializer(data= request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

class UtilityDetailsView(APIView):
    permission_classes = [IsAdminorReadonly]
    def put(self,request,pk):
        utility = Utility.objects.get(id=pk)
        serializer =  UtitlitySerializer(utility,data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    def patch(self,request,pk):
        utility = Utility.objects.get(id=pk)
        serializer =  UtitlitySerializer(utility,data = request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def delete(self,request,pk):
        try:
            utility = Utility.objects.get(id=pk)
            utility.delete()
            return Response({"status":"utility sucessfully deleted!"})
        except Utility.DoesNotExist:
            return Response({"error":"Not found"},status=404)


class utilityScheduleView(APIView):

    def get(self,request):
        schedules = UtilitySchedule.objects.all()
        serializer = UtilityScheduleSerializer(schedules,many = True)
        return Response(serializer.data)


    def post(self,request):
        serializer = UtilityScheduleSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

class UtilityScheduleDetailsView(APIView):
    permission_classes = [IsAdminorReadonly]

    def get(self,request,pk):
        try:
            schedule = UtilitySchedule.objects.get(id = pk)
            serializer = UtilityScheduleSerializer(schedule)
            return Response(serializer.data)
        except UtilitySchedule.DoesNotExist:
            return Response({"error":"Not found"},status=404)

    def put(self,request,pk):
        try:
            schedule = UtilitySchedule.objects.get(id = pk)
            serializer = UtilityScheduleSerializer(schedule,data = request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors)
        except UtilitySchedule.DoesNotExist:
            return Response({"error":"Not found"},status=404)
    def patch(self,request,pk):
            try:
                schedule = UtilitySchedule.objects.get(id = pk)
                serializer = UtilityScheduleSerializer(schedule,data = request.data,partial = True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors)
            except UtilitySchedule.DoesNotExist:
                return Response({"error":"Not found"},status=404)

    def delete(self,request,pk):
        try:
             schedule = UtilitySchedule.objects.get(id = pk)
             schedule.delete()
             return Response({"status":"Deleted sucessfully!"})
        except UtilitySchedule.DoesNotExist:
            return Response({"error":"Not found"},status=404)
        

        




    


    


        

