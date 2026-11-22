from rest_framework import serializers
from ..models import GovernmentScheme


class SchemeSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = GovernmentScheme
        fields = "__all__"

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError(
                {"end_date": "Deadline precedes the start date."}
            )
        return attrs

    def validate_official_website(self, value):
        if value and not value.startswith(("https://", "http://")):
            raise serializers.ValidationError("Enter an HTTP or HTTPS address.")
        return value
