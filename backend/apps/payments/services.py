from .models import Payment


class PaymentService:
    """
    Business logic layer for Payments.
    """

    @staticmethod
    def process_successful_payment(payment: Payment) -> Payment:
        """
        When a payment is marked as successful, automatically update
        the associated invoice status.
        """
        if payment.status != 'SUCCESSFUL':
            return payment

        invoice = payment.invoice

        if payment.payment_type == 'DEPOSIT':
            invoice.status = 'DEPOSIT_PAID'
        elif payment.payment_type == 'BALANCE':
            invoice.status = 'PAID'

        # Save the updated invoice state
        invoice.save(update_fields=['status', 'updated_at'])

        return payment