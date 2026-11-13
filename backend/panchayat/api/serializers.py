from rest_framework import serializers
from ..models import Panchayat

class PanchayatSerializer(serializers.ModelSerializer):

    class Meta:
        model = Panchayat
        fields = "__all__"
