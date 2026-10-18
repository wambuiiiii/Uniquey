from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


@shared_task
def send_email_message(notification_id):
    """
    Celery background worker that dispatches HTML emails using Resend via Django's email backend.
    Updates the Notification model status to 'SENT' or 'FAILED'.
    """
    try:
        notification = Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        print(f"[Celery] Notification {notification_id} not found. Task aborted.")
        return

    if notification.channel != 'EMAIL':
        print(f"[Celery] Notification {notification_id} channel is '{notification.channel}'. Skipping email process.")
        return

    try:
        # 1. Fetch the email address safely (supports direct guest emails or linked customer profiles)
        target_email = notification.guest_email
        if not target_email and notification.recipient_customer and notification.recipient_customer.user:
            target_email = notification.recipient_customer.user.email

        if not target_email:
            raise Exception("No target email address found for this notification.")

        from_email = settings.DEFAULT_FROM_EMAIL

        # 2. Send the email
        send_mail(
            subject=notification.title,
            message=notification.message,  # Plain text fallback
            from_email=from_email,
            recipient_list=[target_email],
            html_message=notification.message,  # Pass the raw HTML directly
            fail_silently=False,
        )

        notification.status = 'SENT'
        notification.save(update_fields=['status', 'updated_at'])
        print(f"[Celery] Email sent to {target_email}")

    except Exception as e:
        notification.status = 'FAILED'
        notification.failure_reason = str(e)
        notification.save(update_fields=['status', 'failure_reason', 'updated_at'])
        print(f"[Celery] Error sending Notification {notification_id}: {str(e)}")