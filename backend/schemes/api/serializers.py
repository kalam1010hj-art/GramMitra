from rest_framework import serializers
from ..models import GovernmentScheme

class SchemeSerializer(serializers.ModelSerializer):

    class Meta:
        model = GovernmentScheme
        fields = "__all__"

