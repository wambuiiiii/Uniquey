from django.apps import apps
from django.utils import timezone
from rest_framework import serializers

from .models import Inquiry


class InquirySerializer(serializers.ModelSerializer):
    """
    Serializer to handle both creation (public website submission)
    and retrieval/updates (admin dashboard management) of travel inquiries.
    """

    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    selected_accommodation = serializers.SerializerMethodField()
    invoice_summary = serializers.SerializerMethodField()
    class Meta:
        model = Inquiry
        fields = '__all__'
        read_only_fields = [
            'id',
            'purpose_display',
            'status_display',
            'selected_accommodation',
            'invoice_summary',
            'created_at',
            'updated_at',
        ]
    def validate_arrival_date(self, value):
        """
        Validates that the travel arrival date is placed in the future.
        """
        if value < timezone.localdate():
            raise serializers.ValidationError("Arrival date cannot be in the past.")
        return value

    def validate(self, data):
        """
        Object-level validation to catch logical cross-field contradictions.
        """
        arrival = data.get('arrival_date')
        departure = data.get('departure_date')

        if arrival and departure and departure <= arrival:
            raise serializers.ValidationError({
                "departure_date": "Departure date must occur after the arrival date."
            })

        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')

        if budget_min is not None and budget_max is not None:
            if budget_min < 0 or budget_max < 0:
                raise serializers.ValidationError({
                    "budget_min": "Budget values cannot be negative numbers."
                })
            if budget_max < budget_min:
                raise serializers.ValidationError({
                    "budget_max": "Maximum budget cannot be less than the minimum budget."
                })

        guests = data.get('guests')
        if guests is not None and guests < 1:
            raise serializers.ValidationError({
                "guests": "An inquiry must include at least 1 guest."
            })

        return data

    def get_selected_accommodation(self, obj):
        """
        Returns the property details if the guest has clicked 'Select This Apartment'
        on their proposal link (accepted=True).
        """
        if not hasattr(obj, 'recommendations'):
            return None

        accepted_rec = (
            obj.recommendations.filter(accepted=True)
            .select_related('accommodation')
            .prefetch_related('accommodation__images')
            .first()
        )
        if not accepted_rec or not accepted_rec.accommodation:
            return None

        apt = accepted_rec.accommodation

        # --- NEW DATE MATH LOGIC ---
        nights = 1
        if obj.arrival_date and obj.departure_date:
            calculated_nights = (obj.departure_date - obj.arrival_date).days
            if calculated_nights > 0:
                nights = calculated_nights
        # ---------------------------

        nightly_rate = float(apt.nightly_price or 0)

        cover_image_url = None
        first_img = apt.images.first()
        if first_img and first_img.image:
            request = self.context.get('request')
            if request is not None:
                cover_image_url = request.build_absolute_uri(first_img.image.url)
            else:
                cover_image_url = first_img.image.url

        return {
            "recommendation_id": str(accepted_rec.id),
            "property_id": str(apt.id),
            "property_name": apt.property_name,
            "area": apt.area,
            "bedrooms": apt.bedrooms,
            "nightly_price": nightly_rate,
            "duration_nights": nights,
            "calculated_stay_total": nightly_rate * nights,
            "cover_image": cover_image_url,
        }
    def get_invoice_summary(self, obj):
        """
        Looks up the latest invoice associated with this inquiry.
        """
        try:
            Invoice = apps.get_model('invoices', 'Invoice')
        except LookupError:
            return None

        # Invoices are linked to inquiries and store the guest email directly.
        inv = (
            Invoice.objects
            .filter(guest_email__iexact=obj.email)
            .order_by('-created_at')
            .first()
        )

        if not inv:
            return None

        return {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "status": inv.status,
            "status_display": inv.get_status_display() if hasattr(inv, 'get_status_display') else inv.status,
            "grand_total": float(getattr(inv, 'grand_total', 0) or 0),
            "deposit_required": float(getattr(inv, 'deposit_required', 0) or 0),
            "deposit_paid": inv.status in ['DEPOSIT_PAID', 'PAID'],
        }