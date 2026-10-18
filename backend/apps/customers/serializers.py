from rest_framework import serializers
from .models import Customer
from ..invoices.models import Invoice


class CustomerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    account_status_display = serializers.CharField(source='get_account_status_display', read_only=True)

    # NEW: Fields for the Admin Dashboard UI
    trip_count = serializers.IntegerField(read_only=True, default=0)
    is_vip = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'email', 'first_name', 'last_name', 'nationality',
            'phone', 'whatsapp', 'account_status', 'account_status_display',
            'inquiry', 'trip_count', 'is_vip', 'created_at', 'updated_at'  # Added new fields
        ]
        read_only_fields = ['id', 'inquiry', 'account_status', 'created_at', 'updated_at']

    def get_is_vip(self, obj):
        """
        Calculates VIP status on the fly.
        If a customer has 3 or more trips, they are marked as VIP for the Admin.
        """
        count = getattr(obj, 'trip_count', 0)
        return count >= 3


class PortalAccommodationSerializer(serializers.Serializer):
    title = serializers.CharField(default="Karen Garden Apartment")
    location = serializers.CharField(default="Karen, Nairobi · 25 min from JKIA")
    image_url = serializers.CharField(default="/assets/experience-apartment.jpg")
    amenities = serializers.ListField(
        child=serializers.CharField(),
        default=[
            "Female host on-site",
            "24h security",
            "Verified Wi-Fi 50 Mbps",
            "Airport pickup included",
        ]
    )


class PortalInvoiceSerializer(serializers.Serializer):
    invoice_number = serializers.CharField()
    currency = serializers.CharField()
    package_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    accommodation_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    additional_fees = serializers.DecimalField(max_digits=10, decimal_places=2)
    grand_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    deposit_required = serializers.DecimalField(max_digits=10, decimal_places=2)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    deposit_paid = serializers.BooleanField()
    due_date = serializers.DateField(allow_null=True, required=False)


class CustomerPortalDashboardSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    email = serializers.EmailField()
    has_active_trip = serializers.BooleanField()

    days_until_arrival = serializers.IntegerField(required=False, allow_null=True)
    package_name = serializers.CharField(required=False, allow_null=True)
    arrival_date = serializers.CharField(required=False, allow_null=True)
    duration_nights = serializers.IntegerField(required=False, allow_null=True)

    timeline = serializers.ListField(child=serializers.DictField(), required=False)
    accommodation = serializers.DictField(required=False, allow_null=True)
    invoice = PortalInvoiceSerializer(required=False, allow_null=True)
