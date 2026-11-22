from django.db import models


class DirectoryEntry(models.Model):
    full_name = models.CharField(max_length=150)
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    office = models.CharField(max_length=250, blank=True)
    public_contact = models.CharField(max_length=150, blank=True)
    profile_image = models.ImageField(upload_to="directory/", blank=True)
    is_active = models.BooleanField(default=True)
