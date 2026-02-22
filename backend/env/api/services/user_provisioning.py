from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction
from api.utils.password import create_set_password_token
from api.services.mailer import send_set_password_email

User = get_user_model()

def provision_user(*, email: str, role: str, first_name: str = "", last_name: str = "") -> User:
    with transaction.atomic():
        role = (role or "").upper()

        must_change = role in ("AGENT", "MANAGER")
        is_active = True if role == "ADMIN" else False

        user = User.objects.create(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            must_change_password=must_change,
            is_active=is_active,
        )

        # ✅ AGENT/MANAGER: pas de mdp -> set via lien email
        if must_change:
            user.set_unusable_password()
            user.save()

            raw = create_set_password_token(user)

        else:
            # ✅ ADMIN: pas de lien set-password par défaut
            raw = None

    # ✅ envoyer mail AGENT/MANAGER
    if raw:
        front = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:4200")
        link = f"{front}/set-password?token={raw}"
        send_set_password_email(email=email, first_name=first_name, link=link)

    return user
