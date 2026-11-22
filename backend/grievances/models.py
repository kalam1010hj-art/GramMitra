from django.db import models
from django.conf import settings
from .storage import private_images


class Grievance(models.Model):

    class Category(models.TextChoices):
        WATER = "WATER", "Water Supply"
        ELECTRICITY = "ELECTRICITY", "Electricity"
        ROAD = "ROAD", "Roads"
        DRAINAGE = "DRAINAGE", "Drainage"
        SANITATION = "SANITATION", "Sanitation"
        STREET_LIGHT = "STREET_LIGHT", "Street Lights"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        RESOLVED = "RESOLVED", "Resolved"
        REJECTED = "REJECTED", "Rejected"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        URGENT = "URGENT", "Urgent"

    # Resident who submitted the grievance
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="grievances"
    )

    # Complaint information
    title = models.CharField(max_length=200)

    description = models.TextField()

    category = models.CharField(
        max_length=30,
        choices=Category.choices
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    image = models.ImageField(
        upload_to="grievances/",
        storage=private_images,
        null=True,
        blank=True
    )

    # Complaint tracking
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    # Official assigned to the grievance
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_grievances"
    )

    assigned_at = models.DateTimeField(null=True, blank=True, db_index=True)

    # Resolution information
    resolution_note = models.TextField(
        blank=True
    )

    resolved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    @property
    def tracking_id(self):
        if self.pk is None:
            return None
        return f"GM-{self.pk:06d}"

    def __str__(self):
        return f"{self.title} - {self.status}"

    class Meta:
        indexes = [models.Index(fields=["user", "-created_at"]), models.Index(fields=["assigned_to", "status"])]
        ordering = ["-created_at"]

class GrievanceUpdates(models.Model):
    grievance = models.ForeignKey(Grievance,
                                  on_delete=models.CASCADE,
                                  related_name="updates"
                                  )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
        )
    old_status = models.CharField(
        max_length=200,
        blank=True
    )
    new_status = models.CharField(max_length=200)
    message = models.TextField(
        blank=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Update for Grievance #{self.grievance_id}"

