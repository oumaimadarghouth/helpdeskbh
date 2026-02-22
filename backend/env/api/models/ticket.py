# api/models/ticket.py
from django.conf import settings
from django.db import models

class Ticket(models.Model):
    STATUS_CHOICES = [("OPEN","OPEN"),("IN_PROGRESS","IN_PROGRESS"),("RESOLVED","RESOLVED"),("CLOSED","CLOSED")]
    PRIORITY_CHOICES = [("P1","P1"),("P2","P2"),("P3","P3")]

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tickets_created")
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=64)
    priority = models.CharField(max_length=8, choices=PRIORITY_CHOICES)
    impact = models.CharField(max_length=32)
    description = models.TextField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="OPEN")

    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="tickets_assigned")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    