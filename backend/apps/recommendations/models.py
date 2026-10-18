import uuid
from django.db import models


class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Connects back to the original form submission. 
    # If the inquiry is deleted, we cascade delete the recommendation.
    inquiry = models.ForeignKey(
        'inquiries.Inquiry',
        on_delete=models.CASCADE,
        related_name='recommendations'
    )

    # Points to the specific property from your private accommodation inventory.
    accommodation = models.ForeignKey(
        'properties.Accommodation',
        on_delete=models.CASCADE,
        related_name='recommendations'
    )

    # The personalized note written by the admin explaining the choice.
    # Maps directly to the "Reason: Perfect for your arrival schedule..." card in your UI.
    recommendation_reason = models.TextField()

    # Tracks whether this proposal has been sent to the traveler's secure link yet.
    sent = models.BooleanField(default=False)

    # True if the user clicks "Select This Property" on their personalized page.
    accepted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Recommendation for {self.inquiry.first_name} - {self.accommodation.property_name}"