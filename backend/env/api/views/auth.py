from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = getattr(user, "role", "")
        token["must_change_password"] = getattr(user, "must_change_password", False)
        return token

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
