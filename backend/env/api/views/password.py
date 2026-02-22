from django.db import transaction
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.utils.password import get_token_obj

def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")

class VerifySetPasswordToken(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"detail": "Token manquant"}, status=400)

        ott = get_token_obj(token)
        if not ott or ott.is_used() or ott.is_expired():
            return Response({"detail": "Lien expiré / invalide / déjà utilisé"}, status=400)

        return Response({"detail": "OK"}, status=200)

class SetPassword(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        if not token or not new_password:
            return Response({"detail": "Champs manquants"}, status=400)

        ip = get_client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")

        with transaction.atomic():
            ott = get_token_obj(token)
            if not ott:
                return Response({"detail": "Lien expiré / invalide / déjà utilisé"}, status=400)

            # lock row (anti double-usage)
            ott = type(ott).objects.select_for_update().get(pk=ott.pk)

            if ott.is_used() or ott.is_expired():
                return Response({"detail": "Lien expiré / invalide / déjà utilisé"}, status=400)

            try:
                validate_password(new_password, user=ott.user)
            except Exception as e:
                return Response({"detail": [str(x) for x in e]}, status=400)

            ott.user.set_password(new_password)
            # si tu as ces champs dans ton User:
            if hasattr(ott.user, "must_change_password"):
                ott.user.must_change_password = False
            if hasattr(ott.user, "is_active"):
                ott.user.is_active = True
            ott.user.save()

            ott.used_at = timezone.now()
            if hasattr(ott, "used_ip"):
                ott.used_ip = ip
            if hasattr(ott, "used_user_agent"):
                ott.used_user_agent = ua
            ott.save()

        return Response({"detail": "Mot de passe défini avec succès"}, status=200)

class ChangePassword(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"detail": "Champs manquants"}, status=400)

        user = request.user

        if not user.check_password(old_password):
            return Response({"detail": "Ancien mot de passe incorrect"}, status=400)

        try:
            validate_password(new_password, user=user)
        except Exception as e:
            return Response({"detail": [str(x) for x in e]}, status=400)

        user.set_password(new_password)

        # ✅ après changement on enlève la contrainte
        if hasattr(user, "must_change_password"):
            user.must_change_password = False

        user.save()

        return Response({"detail": "Mot de passe changé"}, status=200)
