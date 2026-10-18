from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Trip
from .serializers import TripSerializer
from ..accounts.permissions import IsAdminRole


class TripViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing Trips.
    """
    serializer_class = TripSerializer

    def get_permissions(self):
        # Only Admins can create or modify trips
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        # Customers can view their own trips
        return [IsAuthenticated()]
    def get_queryset(self):
        """
        Admins view all trips (ordered by soonest arrival).
        Customers view only their own trips.
        """
        user = self.request.user
        if getattr(user, 'role', None) == 'admin' or user.is_superuser:
            return Trip.objects.all().order_by('arrival_date')

        return Trip.objects.filter(customer__user=user).order_by('arrival_date')

    def perform_update(self, serializer):
        # Save the updated data first
        trip = serializer.save()

        # If the status was included in the update payload, pass it to the service layer
        if 'status' in self.request.data:
            from .services import TripService  # Import added here to avoid circular imports
            TripService.advance_trip_status(trip, self.request.data['status'])