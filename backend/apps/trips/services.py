from .models import Trip


class TripService:
    """
    Business logic layer for Trips.
    """

    @staticmethod
    def advance_trip_status(trip: Trip, new_status: str) -> Trip:
        """
        Securely advances the trip lifecycle (e.g., from PLANNING to ACTIVE).
        """
        trip.status = new_status
        trip.save(update_fields=['status', 'updated_at'])
        return trip