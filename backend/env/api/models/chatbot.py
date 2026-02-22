from django.conf import settings
from django.db import models
from django.utils import timezone

class ChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    state = models.CharField(max_length=32, default="COLLECTING")  # COLLECTING | CONFIRM_CREATE | DONE

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=16)  # "user" | "assistant"
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class TicketDraft(models.Model):
    session = models.OneToOneField(ChatSession, related_name="draft", on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True, default="")
    category = models.CharField(max_length=64, blank=True, default="")   # e.g. IT_HARDWARE, AUTH, BUG...
    priority = models.CharField(max_length=8, blank=True, default="")    # P1/P2/P3
    impact = models.CharField(max_length=32, blank=True, default="")     # ONE_USER / TEAM / BRANCH
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def is_complete(self):
        return all([self.title, self.category, self.priority, self.impact, self.description])
