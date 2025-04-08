from rest_framework import serializers

class AIQuerySerializer(serializers.Serializer):
    query = serializers.CharField(required=True, max_length=1000)
    context = serializers.CharField(required=False, allow_blank=True)
    max_length = serializers.IntegerField(required=False, default=512) 