from rest_framework import serializers
from ..models import Utility, UtilitySchedule


class UtilityScheduleSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = UtilitySchedule
        fields = "__all__"

    def validate(self, attrs):
        def field(key, default=None):
            return attrs.get(key, getattr(self.instance, key, default))

        utility = field("utility")
        start, end, day = field("start_time"), field("end_time"), field("day", "DAILY")
        if end <= start:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time on the same day."}
            )
        Utility.objects.select_for_update().get(pk=utility.pk)
        conflicts = UtilitySchedule.objects.filter(
            utility=utility, is_active=True, start_time__lt=end, end_time__gt=start
        )
        if day != "DAILY":
            conflicts = conflicts.filter(day__in=["DAILY", day])
        if self.instance:
            conflicts = conflicts.exclude(pk=self.instance.pk)
        if field("is_active", True) and conflicts.exists():
            raise serializers.ValidationError(
                "This utility already has an overlapping schedule."
            )
        return attrs


class UtitlitySerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(default=True)
    schedules = UtilityScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Utility
        fields = ["id", "name", "utility_type", "description", "is_active", "schedules"]
