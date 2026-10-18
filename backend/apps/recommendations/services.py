import random
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.apps import apps
from .models import Recommendation


class RecommendationService:
    """
    Isolates the business logic for recommendations.
    """

    @staticmethod
    @transaction.atomic
    def accept_recommendation(recommendation: Recommendation) -> Recommendation:
        inquiry = recommendation.inquiry
        apt = recommendation.accommodation

        # 1. Reset any previously accepted recommendation on this inquiry (excluding current)
        inquiry.recommendations.exclude(id=recommendation.id).update(accepted=False)

        # 2. Mark the chosen property as accepted
        recommendation.accepted = True
        recommendation.save(update_fields=['accepted', 'updated_at'])

        # 3. Advance the Inquiry status so Admin sees it immediately
        inquiry.status = 'OPTION_SELECTED'
        inquiry.save(update_fields=['status', 'updated_at'])

        # 4. Automatically create or update a DRAFT Invoice
        try:
            Invoice = apps.get_model('invoices', 'Invoice')

            # FIX: Calculate nights from actual dates instead of duration_nights
            nights_val = 1
            if inquiry.arrival_date and inquiry.departure_date:
                calculated_nights = (inquiry.departure_date - inquiry.arrival_date).days
                if calculated_nights > 0:
                    nights_val = calculated_nights

            nights = Decimal(str(nights_val))
            stay_total = (apt.nightly_price or Decimal('0.00')) * nights

            # FIX: Removed manual deposit calculation completely. Let Invoice.save() do it.
            draft_inv = Invoice.objects.filter(inquiry=inquiry, status='DRAFT').first()

            if draft_inv:
                draft_inv.accommodation_total = stay_total
                # Setting deposit to 0 forces the model to auto-calculate the exact 30%
                draft_inv.deposit_required = Decimal('0.00')
                draft_inv.save()
            else:
                Invoice.objects.create(
                    invoice_number=f"INV-{random.randint(100000, 999999)}",
                    inquiry=inquiry,
                    guest_name=f"{inquiry.first_name} {inquiry.last_name}",
                    guest_email=inquiry.email,
                    guest_phone=inquiry.phone,
                    accommodation_total=stay_total,
                    # No deposit_required passed, models.py handles it
                    currency='KES',
                    due_date=timezone.now().date() + timedelta(days=3),
                    status='DRAFT',
                )
        except LookupError:
            pass

        return recommendation

    @staticmethod
    def mark_as_sent(recommendation: Recommendation) -> Recommendation:
        recommendation.sent = True
        recommendation.save(update_fields=['sent', 'updated_at'])
        return recommendation