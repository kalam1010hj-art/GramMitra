from hashlib import sha256

import cloudinary.api
import cloudinary.uploader
from cloudinary.exceptions import NotFound
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from grievances.models import Grievance


class Command(BaseCommand):
    help = "Count legacy Cloudinary evidence or move it to authenticated delivery."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply", action="store_true", help="Perform the media migration."
        )

    def handle(self, *args, **options):
        rows = (
            Grievance.objects.exclude(image="")
            .exclude(image__isnull=True)
            .exclude(image__startswith="grammitra-private/")
            .order_by("pk")
        )
        self.stdout.write(f"Legacy grievance attachments: {rows.count()}")
        if not options["apply"]:
            return
        if not all(settings.CLOUDINARY_STORAGE.values()):
            raise CommandError("Cloudinary credentials are required.")
        for pk in rows.values_list("pk", flat=True).iterator():
            with transaction.atomic():
                row = rows.select_for_update().filter(pk=pk).first()
                if row is None:
                    continue
                old = row.image.name
                target = "grammitra-private/" + sha256(old.encode()).hexdigest()
                # A previous run may have renamed the remote asset before its DB commit.
                try:
                    result = cloudinary.api.resource(
                        target, resource_type="image", type="authenticated"
                    )
                except NotFound:
                    result = cloudinary.uploader.rename(
                        old,
                        target,
                        type="upload",
                        to_type="authenticated",
                        resource_type="image",
                        invalidate=True,
                        overwrite=False,
                    )
                row.image = f"{result['public_id']}.{result['format']}"
                row.save(update_fields=["image"])
            self.stdout.write(f"Updated grievance {pk}")
