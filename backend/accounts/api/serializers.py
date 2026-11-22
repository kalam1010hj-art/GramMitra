from rest_framework import serializers
from ..models import User

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length = 20)
    password = serializers.CharField(max_length = 200)
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id","username","email","profile_image","phone","full_name","role","is_active","is_staff"]
        
class RegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username","email","phone","full_name","password","confirm_password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }


    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs

    
    def create(self, validated_data):

        validated_data.pop("confirm_password")

        user = User.objects.create_user(**validated_data)

        return user
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = [
            "username",
            "full_name",
            "email",
            "phone",
            "profile_image",
            "role",
        ]
        read_only_fields = [
             "username",
            "phone",
            "role",
        ]
        