import uuid
from django.db import models


class Payment(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('DEPOSIT', 'Deposit'),
        ('BALANCE', 'Final Balance'),
        ('REFUND', 'Refund'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESSFUL', 'Successful'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Links back to the invoice being paid
    invoice = models.ForeignKey(
        'invoices.Invoice',
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)

    # Tracks the exact provider (e.g., Stripe, M-Pesa) and their secure receipt code
    gateway = models.CharField(max_length=50)
    transaction_reference = models.CharField(max_length=255, unique=True, null=True, blank=True)

    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_type} - {self.amount} ({self.status})"