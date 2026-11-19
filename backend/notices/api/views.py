from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import NoticeSerializer
from ..models import Notice


# This view is used for Notice Page  to display all available notices in the Database.
# And also used for Notice Tricker component to display important notices

class NoticeView(APIView):

    def get(self,request):
        notices = Notice.objects.all()
        noticeTricker = request.query_params.get("noticeTricker",False)
        if noticeTricker:
            notices = notices.filter(display_it=True)
        serializer = NoticeSerializer(notices,many = True)
        return Response(serializer.data)

class NoticeDetailsView(APIView):
    def get(self,request,pk):
       try:
           notice = Notice.objects.get(id=pk )
           serializer = NoticeSerializer(notice)
           return Response(serializer.data)
       except Notice.DoesNotExist:
           return Response({"details":"Notice doesn't exist."},status=404)









    

