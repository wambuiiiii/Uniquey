import uuid
from django.db import models
from django.core.exceptions import ValidationError

# --- NEW: 2MB Failsafe Validator ---
def validate_image_size(image):
    max_size_mb = 2
    if image.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image size exceeds {max_size_mb}MB limit. Please compress before uploading.")

class Accommodation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property_name = models.CharField(max_length=255)

    host_name = models.CharField(max_length=255, blank=True)
    host_phone = models.CharField(max_length=50, blank=True)

    area = models.CharField(max_length=255)
    address = models.TextField()
    google_maps_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Google Maps share link or pin"
    )

    nightly_price = models.DecimalField(max_digits=10, decimal_places=2)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    capacity = models.PositiveIntegerField(default=2)

    wifi = models.BooleanField(default=True)
    parking = models.BooleanField(default=True)
    airport_minutes = models.PositiveIntegerField(default=0)
    supermarket_distance = models.PositiveIntegerField(default=0)
    hospital_distance = models.PositiveIntegerField(default=0)

    female_friendly = models.BooleanField(default=False)
    family_friendly = models.BooleanField(default=False)
    medical_friendly = models.BooleanField(default=False)
    business_friendly = models.BooleanField(default=False)

    safety_score = models.PositiveIntegerField(default=0)
    verification_status = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.property_name


class AccommodationImage(models.Model):
    """Stores multiple photos for each accommodation."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    accommodation = models.ForeignKey(
        Accommodation,
        on_delete=models.CASCADE,
        related_name='images'
    )
    # CHANGED: Added the validator to the ImageField
    image = models.ImageField(upload_to='accommodations/', validators=[validate_image_size])
    is_cover = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.accommodation.property_name}"


class AccommodationBooking(models.Model):
    """Tracks manual blocks and client bookings to prevent double-booking."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    accommodation = models.ForeignKey(Accommodation, on_delete=models.CASCADE, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.accommodation.property_name} blocked {self.check_in} to {self.check_out}"