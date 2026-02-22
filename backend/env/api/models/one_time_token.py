from django.conf import settings
from django.db import models
from django.utils import timezone

class OneTimeToken(models.Model):
    PURPOSE_SET_PASSWORD = "SET_PASSWORD"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    purpose = models.CharField(max_length=32)
    token_hash = models.CharField(max_length=128, unique=True)

    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    used_ip = models.GenericIPAddressField(null=True, blank=True)
    created_ip = models.GenericIPAddressField(null=True, blank=True)
    used_user_agent = models.TextField(null=True, blank=True)
    created_user_agent = models.TextField(null=True, blank=True)

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def is_used(self):
        return self.used_at is not None
