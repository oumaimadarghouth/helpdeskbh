from django.conf import settings
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    phone = models.CharField(max_length=30, blank=True, null=True)
    department = models.CharField(max_length=120, blank=True, null=True)
    contract_type = models.CharField(max_length=120, blank=True, null=True)  # ou FK si table SQL
    avatar = models.URLField(blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user_id})"
