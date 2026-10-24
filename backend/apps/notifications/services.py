from django.apps import apps
from .models import Notification
from .tasks import send_email_message

class NotificationService:
    @staticmethod
    def broadcast_to_admins(title: str, message: str):
        CustomUser = apps.get_model('accounts', 'CustomUser')
        admins = CustomUser.objects.filter(is_staff=True, is_active=True)
        for admin in admins:
            Notification.objects.create(
                recipient_user=admin, title=title, message=message, channel='IN_APP'
            )

    @staticmethod
    def send_guest_email(email: str, title: str, message: str, customer=None):
            """
            Creates a notification record and attempts to pass it to Celery.
            If Celery is down, it catches the error so it doesn't break the payment transaction!
            """
            # 1. Save the email attempt to the database
            notification = Notification.objects.create(
                guest_email=email,
                recipient_customer=customer,
                channel='EMAIL',
                title=title,
                message=message,
                status='PENDING'
            )

            # 2. Try to trigger Celery safely
            try:
                send_email_message.delay(notification.id)
            except Exception as e:
                # If Redis/Celery is broken, print the error but DO NOT crash the app
                print(f"⚠️ Warning: Payment succeeded, but Celery failed to queue the email. Error: {str(e)}")

                notification.status = 'FAILED'
                notification.failure_reason = "Redis/Celery connection failed"
                notification.save(update_fields=['status', 'failure_reason'])

            return notification