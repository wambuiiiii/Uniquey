from .models import Accommodation


class PropertyService:
    """
    Business logic layer for Property management.
    """

    @staticmethod
    def verify_accommodation(accommodation: Accommodation) -> Accommodation:
        """
        Marks an accommodation as verified and ready to be recommended to guests.
        """
        accommodation.verification_status = True
        accommodation.save(update_fields=['verification_status', 'updated_at'])
        return accommodation