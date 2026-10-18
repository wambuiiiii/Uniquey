from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'status', 'is_read', 'created_at')
    list_filter = ('channel', 'status', 'is_read')
    search_fields = ('recipient_user__email', 'recipient_customer__user__email', 'title')
    readonly_fields = ('id', 'created_at', 'updated_at')