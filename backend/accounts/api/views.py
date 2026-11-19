from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .serializers import LoginSerializer,UserSerializer,RegisterSerializer,ProfileSerializer
from ..models import User
from rest_framework.authtoken.models import Token


class LoginView(APIView):

    

    def post(self,request):
        serializer = LoginSerializer(data = request.data)
    
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            password = serializer.validated_data["password"]
            user = authenticate(username=username,password=password)
            
            if user:
               token,is_created = Token.objects.get_or_create(user=user)
               serializer = UserSerializer(user)
               return Response({"token":token.key,"user":serializer.data})
            return Response({"error":"Invalid credintials"},status=401)
        return Response({"detail": "Invalid username or password.","error":serializer.errors},status=400)


class RegisterView(APIView):

    def post(self,request):
        serializer = RegisterSerializer(data = request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response({"error":serializer.errors,"detail":"Data is Invalid"},status=400)
class ProfileEditView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self,request):
        user = request.user
        print("user : ",user)
        serializer = ProfileSerializer(instance = user,data =request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)




        
