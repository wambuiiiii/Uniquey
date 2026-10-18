from .models import AuditLog, CustomUser

class AuditService:
    @staticmethod
    def log_action(user: CustomUser, action: str, description: str, ip_address: str = None):
        """
        Utility to record sensitive actions.
        Call this when an invoice is deleted, a password is changed, etc.
        """
        AuditLog.objects.create(
            user=user,
            action=action,
            description=description,
            ip_address=ip_address
        )