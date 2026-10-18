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
    def send_guest_email(email: str, title: str, message: str):
        """
        Sends an email directly to an email address without requiring a Customer DB link.
        """
        notification = Notification.objects.create(
            guest_email=email,
            title=title,
            message=message,
            channel='EMAIL',
            status='QUEUED'
        )
        send_email_message.delay(str(notification.id))