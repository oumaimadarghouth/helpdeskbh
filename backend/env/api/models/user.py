from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("AGENT", "Agent"),
        ("MANAGER", "Responsable Help Desk"),
        ("ADMIN", "Admin"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="AGENT")
    must_change_password = models.BooleanField(default=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email
