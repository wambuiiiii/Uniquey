from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'inquiry', 'guest_name', 'guest_email', 'guest_phone',
            'accommodation_total', 'additional_fees',
            'grand_total', 'deposit_required', 'balance_due', 'currency',
            'due_date', 'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'grand_total', 'balance_due',
            'created_at', 'updated_at'
        ]