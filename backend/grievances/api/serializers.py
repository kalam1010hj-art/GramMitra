from rest_framework import serializers
from ..models import Grievance,GrievanceUpdates
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name","profile_image"]


class GrievanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grievance
        fields = "__all__"

class GrievanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrievanceUpdates
        fields ="__all__"

class GrievanceDetailsSerializer(serializers.ModelSerializer):
    updates = GrievanceUpdateSerializer(many=True,read_only = True)
    assigned_to = UserSerializer(read_only = True)
    class Meta:
        model = Grievance
        fields = "__all__"