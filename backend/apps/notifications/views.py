from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from ..accounts.permissions import IsAdminRole


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing System Alerts and Delivery Logs.
    """
    serializer_class = NotificationSerializer

    def get_permissions(self):
        # Only Admins should be creating/deleting notifications manually via API
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [IsAuthenticated()]
    def get_queryset(self):
        user = self.request.user

        if getattr(user, 'role', None) == 'admin' or user.is_superuser:            # Admins see their own in-app alerts PLUS all customer delivery logs
            return Notification.objects.filter(
                models.Q(recipient_user=user) | models.Q(recipient_customer__isnull=False)
            ).order_by('-created_at')

        # Standard customers only see in-app alerts targeted directly to them
        return Notification.objects.filter(recipient_user=user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Custom endpoint: POST /api/v1/notifications/{id}/mark_read/
        Allows the frontend React dashboard to clear the red bell icon notification.
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read', 'updated_at'])

        return Response({"success": True, "message": "Notification marked as read."})