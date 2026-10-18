from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient_user', 'recipient_customer', 'title',
            'message', 'channel', 'status', 'failure_reason',
            'is_read', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']