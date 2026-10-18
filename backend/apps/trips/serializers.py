from rest_framework import serializers
from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    """
    Translates the Trip model into JSON.
    Flattens related accommodation and customer details.
    """
    accommodation_name = serializers.CharField(source='accommodation.property_name', read_only=True)
    customer_name = serializers.CharField(source='customer.user.first_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'customer', 'customer_name', 'accommodation', 'accommodation_name',
            'arrival_date', 'departure_date', 'concierge_notes', 'airport_pickup',
            'status', 'status_display', 'created_at', 'updated_at'
        ]

        # Security: Only admins should update concierge notes or core trip assignments.
        # Customers can view this data but cannot edit it via standard endpoints.
        read_only_fields = ['id', 'created_at', 'updated_at']