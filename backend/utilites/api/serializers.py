from rest_framework import serializers
from ..models import Utility,UtilitySchedule

class UtilityScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilitySchedule
        fields = "__all__"
class UtitlitySerializer(serializers.ModelSerializer):
    schedules =  UtilityScheduleSerializer(many = True,read_only = True)
    class Meta:
        model = Utility
        fields = ["id","name","utility_type","description","is_active","schedules"]