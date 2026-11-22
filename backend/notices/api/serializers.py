from rest_framework import serializers
from ..models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    is_published = serializers.BooleanField(default=True)

    class Meta:
        model = Notice
        fields = [
            "id",
            "title",
            "description",
            "published_at",
            "attachment",
            "display_it",
            "is_important",
            "category",
            "is_published",
            "expires_at",
        ]

    def validate_attachment(self, value):
        if value:
            from config.uploads import validate_image

            field = serializers.ImageField()
            validate_image(field.run_validation(value))
        return value
