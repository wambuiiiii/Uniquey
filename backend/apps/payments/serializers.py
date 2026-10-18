from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """
    Translates the Payment model into JSON.
    Flattens invoice details for frontend rendering.
    """
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    customer_email = serializers.EmailField(source='invoice.customer.user.email', read_only=True)

    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_number', 'customer_email', 'amount',
            'payment_type', 'payment_type_display', 'gateway',
            'transaction_reference', 'status', 'status_display', 'payment_date'
        ]
        # Security: Clients cannot tamper with the payment timestamp or ID.
        read_only_fields = ['id', 'payment_date']