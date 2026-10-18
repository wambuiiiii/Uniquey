import uuid
from django.db import models


class Inquiry(models.Model):
    PURPOSE_CHOICES = [
        ('VACATION', 'Vacation'),
        ('BUSINESS', 'Business'),
        ('MEDICAL', 'Medical'),
        ('DIASPORA', 'Diaspora Visit'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'New Inquiry'),
        ('CONTACTED', 'Contacted'),
        ('QUOTE_SENT', 'Proposal Sent'),
        ('OPTION_SELECTED', 'Apartment Selected'),
        ('INVOICE_SENT', 'Invoice Sent'),
        ('DEPOSIT_RECEIVED', 'Deposit Paid'),
        ('COMPLETED', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=30)
    whatsapp = models.CharField(max_length=30, blank=True)
    nationality = models.CharField(max_length=80)

    arrival_date = models.DateField()
    departure_date = models.DateField()
    guests = models.PositiveIntegerField()
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)

    budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    preferred_location = models.CharField(max_length=255, blank=True)

    # Links to the packages app
    package = models.ForeignKey('packages.Package', on_delete=models.SET_NULL, null=True, blank=True)

    special_requests = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='NEW')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.arrival_date}"