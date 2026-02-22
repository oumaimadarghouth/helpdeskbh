import hashlib, secrets
from datetime import timedelta
from django.utils import timezone
from api.models.one_time_token import OneTimeToken

TTL_MINUTES = 60

def _hash(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def create_set_password_token(user, ip=None, user_agent=None) -> str:
    # ✅ invalide tout ancien lien non utilisé (1 seul lien actif)
    OneTimeToken.objects.filter(
        user=user,
        purpose=OneTimeToken.PURPOSE_SET_PASSWORD,
        used_at__isnull=True
    ).update(used_at=timezone.now())

    raw = secrets.token_urlsafe(48)
    OneTimeToken.objects.create(
        user=user,
        purpose=OneTimeToken.PURPOSE_SET_PASSWORD,
        token_hash=_hash(raw),
        expires_at=timezone.now() + timedelta(minutes=TTL_MINUTES),
        created_ip=ip,
        created_user_agent=user_agent,
    )
    return raw

def get_token_obj(raw: str):
    h = _hash(raw)
    try:
        return OneTimeToken.objects.select_related("user").get(
            token_hash=h,
            purpose=OneTimeToken.PURPOSE_SET_PASSWORD,
        )
    except OneTimeToken.DoesNotExist:
        return None
