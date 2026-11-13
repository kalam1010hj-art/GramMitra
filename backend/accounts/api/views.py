from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import LoginSerializer
from rest_framework.authtoken.models import Token

class LoginView(APIView):

    def get(self,request):
        return Response({"message":"Good night 'Azad' "})

    def post(self,request):
        serializer = LoginSerializer(data = request.data)
    
        if serializer.is_valid():
            phone = request.data["phone"]
            password = request.data["password"]
            user = authenticate(phone=phone,password=password)
            if user:
               token,is_created = Token.objects.get_or_create(user=user)
               return Response({"token":token.key})
            return Response({"error":"Invalid credintials"})
        return Response(serializer.errors)
