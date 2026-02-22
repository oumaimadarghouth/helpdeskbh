from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from api.serializers.me import UserProfilePartSerializer
from api.models import UserProfile

class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_profile(self, request):
        # assure l’existence du profile même si signal raté
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return profile

    def get(self, request):
        profile = self.get_profile(request)
        return Response(UserProfilePartSerializer(profile).data)

    def put(self, request):
        profile = self.get_profile(request)
        serializer = UserProfilePartSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        profile = self.get_profile(request)
        serializer = UserProfilePartSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
