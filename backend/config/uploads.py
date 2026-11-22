from rest_framework import serializers


def validate_image(image):
    if image is None:
        return image
    decoded = getattr(image, "image", None)
    if (
        image.size > 5 * 1024 * 1024
        or decoded is None
        or decoded.format not in {"JPEG", "PNG", "WEBP"}
        or decoded.width * decoded.height > 25_000_000
    ):
        raise serializers.ValidationError(
            "Choose a JPEG, PNG or WebP image up to 5 MB and 25 megapixels."
        )
    return image
