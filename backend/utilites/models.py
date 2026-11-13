from django.db import models

# Create your models here.
class Utility(models.Model):
    UTILITY_TYPES = [
        ("WATER", "Water"),
        ("ELECTRICITY", "Electricity"),
        ("GARBAGE", "Garbage Collection"),
        ("OTHER", "Other"),
    ]

    

    name = models.CharField(max_length=100)

    utility_type = models.CharField(
        max_length=20,
        choices=UTILITY_TYPES
    )

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UtilitySchedule(models.Model):
    DAYS = [
        ("MONDAY", "Monday"),
        ("TUESDAY", "Tuesday"),
        ("WEDNESDAY", "Wednesday"),
        ("THURSDAY", "Thursday"),
        ("FRIDAY", "Friday"),
        ("SATURDAY", "Saturday"),
        ("SUNDAY", "Sunday"),
    ]

    utility = models.ForeignKey(
        Utility,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    day = models.CharField(
        max_length=10,
        choices=DAYS
    )

    start_time = models.TimeField()
    end_time = models.TimeField()

    description = models.CharField(
        max_length=255,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.utility.name} - {self.day}"