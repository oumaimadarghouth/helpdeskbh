from django.db import models
from django.utils import timezone
from django.conf import settings

class PasswordResetRequest(models.Model):
    STATUS_OPEN = "OPEN"
    STATUS_SENT = "SENT"

    STATUS_CHOICES = [
        (STATUS_OPEN, "OPEN"),
        (STATUS_SENT, "SENT"),
    ]

    email = models.EmailField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_OPEN)
    created_at = models.DateTimeField(default=timezone.now)

    handled_at = models.DateTimeField(null=True, blank=True)
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="handled_password_reset_requests"
    )

    note = models.CharField(max_length=255, blank=True, default="expired_link")

    def __str__(self):
        return f"{self.email} - {self.status}"
