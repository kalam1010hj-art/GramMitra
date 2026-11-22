from pathlib import Path
from time import time
from uuid import uuid4

import cloudinary.uploader
import cloudinary.utils
import requests
from cloudinary_storage.storage import MediaCloudinaryStorage
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage, default_storage


class AuthenticatedImages(MediaCloudinaryStorage):
    def _save(self, name, content):
        result = cloudinary.uploader.upload(
            content,
            type="authenticated",
            resource_type="image",
            public_id="grammitra-private/" + uuid4().hex,
            timeout=25,
        )
        return f"{result['public_id']}.{result['format']}"

    def _get_url(self, name):
        if name.startswith("grammitra-private/"):
            public_id, image_format = name.rsplit(".", 1)
            return cloudinary.utils.private_download_url(
                public_id,
                image_format,
                type="authenticated",
                expires_at=int(time()) + 60,
            )
        return default_storage.url(name)

    def _open(self, name, mode="rb"):
        response = requests.get(self._get_url(name), timeout=(4, 20))
        if response.status_code == 404:
            raise FileNotFoundError(name)
        response.raise_for_status()
        return ContentFile(response.content, name=name)

    def delete(self, name):
        if name.startswith("grammitra-private/"):
            cloudinary.uploader.destroy(
                name.rsplit(".", 1)[0],
                type="authenticated",
                resource_type="image",
                invalidate=True,
            )
        else:
            default_storage.delete(name)


def private_images():
    if all(settings.CLOUDINARY_STORAGE.values()):
        return AuthenticatedImages()
    return FileSystemStorage(location=Path(settings.BASE_DIR) / "private-media")
