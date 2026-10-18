from rest_framework import serializers
from django.utils import timezone
from .models import Accommodation, AccommodationImage, AccommodationBooking


class AccommodationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccommodationImage
        fields = ['id', 'image', 'is_cover']


class AccommodationBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccommodationBooking
        fields = ['id', 'check_in', 'check_out']


class AccommodationSerializer(serializers.ModelSerializer):
    images = AccommodationImageSerializer(many=True, read_only=True)
    # The frontend expects this exact naming convention
    active_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Accommodation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_active_bookings(self, obj):
        # Dynamically filters out expired bookings based on today's date
        today = timezone.now().date()
        bookings = obj.bookings.filter(check_out__gte=today).order_by('check_in')
        return AccommodationBookingSerializer(bookings, many=True).data