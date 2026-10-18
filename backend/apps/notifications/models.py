import uuid
from django.db import models


class Notification(models.Model):
    CHANNEL_CHOICES = [
        ('IN_APP', 'Dashboard Alert'),
        ('EMAIL', 'Email Message'),
        ('WHATSAPP', 'WhatsApp Message'),
    ]

    STATUS_CHOICES = [
        ('QUEUED', 'Queued for Delivery'),
        ('SENT', 'Sent Successfully'),
        ('FAILED', 'Delivery Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    recipient_user = models.ForeignKey(
        'accounts.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='system_alerts'
    )
    recipient_customer = models.ForeignKey(
        'customers.Customer', on_delete=models.SET_NULL, null=True, blank=True, related_name='message_logs'
    )

    # FIX: Allow sending emails to guests directly
    guest_email = models.EmailField(blank=True, null=True)

    title = models.CharField(max_length=255)
    message = models.TextField()

    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='IN_APP')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    failure_reason = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        target = self.guest_email or (self.recipient_user.email if self.recipient_user else "Customer")
        return f"[{self.channel}] {self.title} to {target}"