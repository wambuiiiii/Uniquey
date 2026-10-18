import uuid
from django.db import models


class Trip(models.Model):
    TRIP_STATUS_CHOICES = [
        ('PLANNING', 'Planning Phase'),
        ('CONFIRMED', 'Confirmed & Reserved'),
        ('ARRIVING_SOON', 'Arriving Soon (Under 14 Days)'),
        ('ACTIVE', 'Guest Currently in Kenya'),
        ('COMPLETED', 'Trip Successfully Completed'),
        ('CANCELLED', 'Trip Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Links to the confirmed customer profile.
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='trips'
    )

    # The single chosen property where the guest is officially staying.
    accommodation = models.ForeignKey(
        'properties.Accommodation',
        on_delete=models.PROTECT,  # Prevents deleting a property if active trips rely on it.
        related_name='trips'
    )

    arrival_date = models.DateField()
    departure_date = models.DateField()

    # Private operational instructions for the local concierge team handling the guest.
    concierge_notes = models.TextField(blank=True)

    # Toggles the airport transfer logic featured on your home and landing cards.
    airport_pickup = models.BooleanField(default=False)

    status = models.CharField(max_length=30, choices=TRIP_STATUS_CHOICES, default='PLANNING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip to {self.accommodation.property_name} ({self.arrival_date})"