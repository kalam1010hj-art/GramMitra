from django.db import models

# Create your models here
class Notice(models.Model):
    title = models.CharField(max_length=250)
    description = models.TextField()
    published_at = models.DateTimeField(auto_now_add=True)
    attachment = models.FileField(upload_to="notices/",
        blank=True,
        null=True)
    display_it = models.BooleanField(default = False)
    is_important = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title}"

    category = models.CharField(max_length=30, default="GENERAL", choices=[
        (key, key.replace("_", " ").title()) for key in
        ("GENERAL", "WATER", "ELECTRICITY", "MEETING", "HEALTH", "PUBLIC_WORKS", "EMERGENCY")])
    is_published = models.BooleanField(default=True)
    expires_at = models.DateTimeField(blank=True, null=True)
