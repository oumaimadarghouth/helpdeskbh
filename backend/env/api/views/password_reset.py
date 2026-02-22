from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.models import PasswordResetRequest
from api.utils.password import create_set_password_token
from api.services.mailer import send_set_password_email

User = get_user_model()


class CreatePasswordResetRequest(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"detail": "Email manquant"}, status=400)

        PasswordResetRequest.objects.create(email=email, note="expired_link")
        return Response({"detail": "Demande envoyée à l’administrateur"}, status=201)


class AdminListPasswordResetRequests(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", "") != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)

        qs = PasswordResetRequest.objects.order_by("-created_at")
        return Response([
            {"id": r.id, "email": r.email, "status": r.status, "created_at": r.created_at}
            for r in qs
        ])


class AdminResendSetPasswordLink(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, "role", "") != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)

        req_id = request.data.get("request_id")
        if not req_id:
            return Response({"detail": "request_id manquant"}, status=400)

        r = PasswordResetRequest.objects.filter(id=req_id).first()
        if not r:
            return Response({"detail": "Demande introuvable"}, status=404)

        user = User.objects.filter(email__iexact=r.email).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable"}, status=404)

        raw = create_set_password_token(user)

        front = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:4200")
        link = f"{front}/set-password?token={raw}"

        send_set_password_email(
            email=user.email,
            first_name=user.first_name,
            link=link
        )

        r.status = "SENT"
        r.handled_at = timezone.now()
        r.handled_by = request.user
        r.save()

        return Response({"detail": "Lien renvoyé avec succès"}, status=200)
    
    class CreatePasswordResetRequest(APIView):
        authentication_classes = []
        permission_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"detail": "Email manquant"}, status=400)

        now = timezone.now()

        # 🔒 1️⃣ Cooldown 10 minutes
        last = PasswordResetRequest.objects.filter(
            email=email
        ).order_by("-created_at").first()

        if last and now - last.created_at < timedelta(minutes=10):
            return Response(
                {"detail": "Veuillez attendre quelques minutes avant de refaire une demande."},
                status=429
            )

        # 🔒 2️⃣ Max 3 demandes / 24h
        last_24h = now - timedelta(hours=24)
        count = PasswordResetRequest.objects.filter(
            email=email,
            created_at__gte=last_24h
        ).count()

        if count >= 3:
            return Response(
                {"detail": "Trop de demandes. Veuillez contacter le support."},
                status=429
            )

        # ✅ 3️⃣ Création
        PasswordResetRequest.objects.create(
            email=email,
            note="expired_link"
        )

        return Response(
            {"detail": "Demande envoyée à l’administrateur"},
            status=201
        )
