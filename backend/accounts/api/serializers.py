from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length = 20)
    password = serializers.CharField(max_length = 200)
    