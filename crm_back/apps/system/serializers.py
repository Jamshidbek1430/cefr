from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    """
    Sistema sozlamalari serializer
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = [
            'status',
            'status_display',
            'message',
            'updated_at',
        ]
        read_only_fields = ['updated_at']
