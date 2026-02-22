from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
User = get_user_model()


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": getattr(u, "role", None),
            "must_change_password": getattr(u, "must_change_password", False),
            "is_active": u.is_active,
            "last_login": u.last_login,
            "date_joined": u.date_joined,
        })

    def patch(self, request):
        u = request.user
        data = request.data

        if "first_name" in data:
            u.first_name = data["first_name"]
        if "last_name" in data:
            u.last_name = data["last_name"]

        if "email" in data:
            email = (data["email"] or "").strip()
            if not email:
                return Response({"email": "Email obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

            if u.__class__.objects.filter(email=email).exclude(pk=u.pk).exists():
                return Response({"email": "Cet email est déjà utilisé."}, status=status.HTTP_400_BAD_REQUEST)

            u.email = email

        u.save()
        return self.get(request)