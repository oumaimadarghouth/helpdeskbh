from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes

from api.models.user import User
from api.services.permissions import IsRoleAdmin
from api.utils.password import create_set_password_token
from api.services.mailer import send_set_password_email
from api.serializers.admin_user_serializer import (
    AdminCreateUserSerializer,
    AdminUserListSerializer,
)

class AdminUsersView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        role = request.query_params.get("role")
        is_active = request.query_params.get("is_active")
        q = request.query_params.get("q")

        qs = User.objects.exclude(role="ADMIN").order_by("-date_joined")

        if role in ("AGENT", "MANAGER"):
            qs = qs.filter(role=role)

        if is_active is not None:
            if is_active.lower() in ("true", "1", "yes"):
                qs = qs.filter(is_active=True)
            elif is_active.lower() in ("false", "0", "no"):
                qs = qs.filter(is_active=False)

        if q:
            qs = qs.filter(email__icontains=q) | qs.filter(first_name__icontains=q) | qs.filter(last_name__icontains=q) | qs.filter(username__icontains=q)

        data = AdminUserListSerializer(qs, many=True).data
        return Response(data)

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        email = data["email"].lower().strip()

        if User.objects.filter(email=email).exists():
            return Response({"detail": "Email existe déjà"}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
        )
        user.set_unusable_password()
        user.role = data["role"]  # AGENT / MANAGER
        user.must_change_password = True
        user.is_active = False  # activé après set-password
        user.save()

        # ✅ Génération du token (OneTimeToken) comme pour le reset password
        raw_token = create_set_password_token(user)

        # ✅ Construction du lien : juste ?token=...
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:4200")
        link = f"{frontend_url}/set-password?token={raw_token}"

        # ✅ Envoi email via le service centralisé
        send_set_password_email(
            email=user.email,
            first_name=user.first_name,
            link=link
        )

        return Response(
            {"detail": "Utilisateur créé et email envoyé", "id": user.id, "email": user.email, "role": user.role},
            status=status.HTTP_201_CREATED,
        )

class AdminUserToggleActiveView(APIView):
    permission_classes = [IsRoleAdmin]

    def patch(self, request, user_id: int):
        is_active = request.data.get("is_active", None)
        if is_active is None:
            return Response({"detail": "is_active obligatoire (true/false)"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=404)

        if user.role == "ADMIN":
            return Response({"detail": "Action interdite sur un ADMIN"}, status=403)

        user.is_active = bool(is_active)
        user.save(update_fields=["is_active"])
        return Response({"detail": "Statut mis à jour", "id": user.id, "is_active": user.is_active})

class AdminUserDetailView(APIView):
    permission_classes = [IsRoleAdmin]

    def delete(self, request, user_id: int):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=404)

        if user.role == "ADMIN":
            return Response({"detail": "Action interdite sur un ADMIN"}, status=403)

        user.delete()
        return Response({"detail": "Utilisateur supprimé"}, status=status.HTTP_200_OK)
