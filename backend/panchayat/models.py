from django.db import models

# Create your models here.

class Panchayat(models.Model):
    village = models.CharField(max_length=200)
    mandal = models.CharField(max_length=100)

    district = models.CharField(max_length=100)
    state  = models.CharField(max_length=100,default="Telangana")

    pincode = models.CharField(max_length=6)

    description = models.TextField(blank=True)

    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)

    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.village

    

