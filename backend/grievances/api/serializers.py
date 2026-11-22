from rest_framework import serializers
from accounts.models import User
from ..models import Grievance, GrievanceUpdates


class OfficialSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "profile_image"]


class UpdateSerializer(serializers.ModelSerializer):
    updated_by = OfficialSerializer(read_only=True)

    class Meta:
        model = GrievanceUpdates
        fields = [
            "id",
            "updated_by",
            "old_status",
            "new_status",
            "message",
            "created_at",
        ]


from config.uploads import validate_image


class GrievanceSerializer(serializers.ModelSerializer):
    validate_image = staticmethod(validate_image)
    assigned_to = OfficialSerializer(read_only=True)

    def to_representation(self, instance):
        result = super().to_representation(instance)
        result["image"] = (
            f"grievances/{instance.pk}/attachment" if instance.image else None
        )
        return result

    class Meta:
        model = Grievance
        fields = [
            "id",
            "tracking_id",
            "title",
            "description",
            "category",
            "location",
            "image",
            "user",
            "status",
            "priority",
            "assigned_to",
            "resolution_note",
            "resolved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "status", "resolution_note", "resolved_at"]


class GrievanceDetailsSerializer(GrievanceSerializer):
    updates = UpdateSerializer(many=True, read_only=True)

    class Meta(GrievanceSerializer.Meta):
        fields = GrievanceSerializer.Meta.fields + ["updates"]


class ProgressSerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(
        choices=Grievance.Status.choices, required=False
    )
    message = serializers.CharField(required=False)
    resolution_note = serializers.CharField(required=False)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.select_for_update().filter(role="official", is_active=True),
        required=False,
        allow_null=True,
    )
    priority = serializers.ChoiceField(
        choices=Grievance.Priority.choices, required=False
    )
