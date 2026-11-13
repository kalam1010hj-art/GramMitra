from django.db import models

# Create your models here.
class GovernmentScheme(models.Model):
    CATEGORY_CHOICES = [
        ("AGRICULTURE", "Agriculture"),
        ("EDUCATION", "Education"),
        ("HEALTH", "Health"),
        ("HOUSING", "Housing"),
        ("EMPLOYMENT", "Employment"),
        ("PENSION", "Pension"),
        ("WOMEN", "Women"),
        ("STUDENT", "Student"),
        ("OTHER", "Other"),
    ]
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="OTHER"
    )
    name = models.CharField(
        max_length=100
    )

    description = models.TextField(
        blank=True
    )
    benfits = models.TextField(
        blank = True
    )

    required_documents = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)

    official_website = models.URLField(
        blank=True
    )

    start_date = models.DateTimeField( 
        null=True,
        blank=True
    )
    end_date = models.DateTimeField( 
         null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.name
