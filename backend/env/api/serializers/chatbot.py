from rest_framework import serializers

class ChatRequestSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=False)
    message = serializers.CharField()

class DraftSerializer(serializers.Serializer):
    title = serializers.CharField(allow_blank=True, required=False)
    category = serializers.CharField(allow_blank=True, required=False)
    priority = serializers.CharField(allow_blank=True, required=False)
    impact = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
