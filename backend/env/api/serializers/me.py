from django.contrib.auth import get_user_model
from rest_framework import serializers
from api.models.UserProfile import UserProfile

User = get_user_model()

class UserProfilePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["phone", "department", "contract_type"]

class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    must_change_password = serializers.SerializerMethodField()
    profile = UserProfilePartSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "must_change_password",
            "is_active", "last_login", "date_joined",
            "profile"
        ]
        read_only_fields = ["id", "username", "role", "must_change_password", "is_active", "last_login", "date_joined"]

    def get_role(self, obj):
        return getattr(obj, "role", None)

    def get_must_change_password(self, obj):
        return getattr(obj, "must_change_password", False)

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email obligatoire.")
        qs = User.objects.filter(email=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)

        # update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # update profile fields
        if profile_data is not None:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance
