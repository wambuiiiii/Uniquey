import uuid
from decimal import Decimal

from django.db import models


class Invoice(models.Model):
    INVOICE_STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent to Customer'),
        ('DEPOSIT_PAID', 'Deposit Paid'),
        ('PAID', 'Fully Paid'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True)

    inquiry = models.ForeignKey(
        'inquiries.Inquiry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices'
    )
    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=50, blank=True)

    # --- Line Item Computations ---
    accommodation_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    additional_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Grand totals (Auto-calculated on save)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    deposit_required = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    currency = models.CharField(max_length=10, default='KES')
    due_date = models.DateField()
    status = models.CharField(max_length=30, choices=INVOICE_STATUS_CHOICES, default='DRAFT')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # SAFELY CAST EVERYTHING TO DECIMAL
        self.accommodation_total = Decimal(str(self.accommodation_total or '0.00'))
        self.additional_fees = Decimal(str(self.additional_fees or '0.00'))

        # 1. Calculate Grand Total
        self.grand_total = self.accommodation_total + self.additional_fees

        # 2. Calculate 30% Deposit
        self.deposit_required = Decimal(str(self.deposit_required or '0.00'))
        if self.deposit_required == Decimal('0.00'):
            self.deposit_required = (self.grand_total * Decimal('0.30')).quantize(Decimal('0.01'))

        # 3. BALANCE IS STRICTLY GRAND TOTAL - DEPOSIT
        if self.status == 'PAID':
            self.balance_due = Decimal('0.00')
        else:
            self.balance_due = self.grand_total - self.deposit_required

        # FIX: Force Django to save the math columns even if update_fields was passed!
        if 'update_fields' in kwargs:
            fields = set(kwargs['update_fields'])
            fields.update({'grand_total', 'deposit_required', 'balance_due'})
            kwargs['update_fields'] = list(fields)

        super().save(*args, **kwargs)

        # 4. CASCADE STATUS TO INQUIRY
        if self.inquiry:
            new_inquiry_status = None
            if self.status == 'SENT':
                new_inquiry_status = 'INVOICE_SENT'
            elif self.status == 'DEPOSIT_PAID':
                new_inquiry_status = 'DEPOSIT_RECEIVED'
            elif self.status == 'PAID':
                new_inquiry_status = 'COMPLETED'

            if new_inquiry_status and self.inquiry.status != new_inquiry_status:
                self.inquiry.status = new_inquiry_status
                self.inquiry.save(update_fields=['status', 'updated_at'])