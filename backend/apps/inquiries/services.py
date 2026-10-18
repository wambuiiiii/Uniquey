from .models import Inquiry
from apps.accounts.models import CustomUser
from apps.notifications.models import Notification


class InquiryService:
    """
    Business logic layer for Inquiries.
    """

    @staticmethod
    def create_inquiry(validated_data: dict) -> Inquiry:
        """
        Creates a new inquiry from sanitized data.
        In the future, we will trigger the email NotificationService from inside this method.
        """
        inquiry = Inquiry.objects.create(**validated_data)

        # THE TRIGGER: Alert the Admins
        # Find all active admins
        admins = CustomUser.objects.filter(is_staff=True)
        for admin in admins:
            Notification.objects.create(
                recipient_user=admin,
                title="New Trip Inquiry",
                message=f"{inquiry.first_name} wants to travel on {inquiry.arrival_date}",
                channel='IN_APP',
                # No Celery needed here, it just lights up the red bell icon in React!
            )
        return inquiry

    @staticmethod
    def update_inquiry_status(inquiry: Inquiry, new_status: str) -> Inquiry:
        """
        Updates the status of an inquiry securely.
        """
        inquiry.status = new_status
        inquiry.save(update_fields=['status', 'updated_at'])
        return inquiry