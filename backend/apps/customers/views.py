from datetime import date
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import Customer
from .serializers import CustomerSerializer, CustomerPortalDashboardSerializer
from .services import CustomerService
from ..accounts.permissions import IsAdminRole
from ..inquiries.models import Inquiry
from ..invoices.models import Invoice


class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Customer profiles to be viewed and edited.
    """
    serializer_class = CustomerSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'claim']:
            return [IsAdminRole()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin' or user.is_superuser:
            return Customer.objects.annotate(
                trip_count=Count('trips')
            ).order_by('-created_at')
        return Customer.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        updated_customer = CustomerService.update_profile(instance, serializer.validated_data)
        response_serializer = self.get_serializer(updated_customer)

        return Response({
            "success": True,
            "message": "Profile updated successfully.",
            "data": response_serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        customer = self.get_object()
        customer.assigned_to = request.user
        customer.save(update_fields=['assigned_to', 'updated_at'])

        return Response({
            "success": True,
            "message": f"You are now managing {customer.user.first_name}'s trip."
        })


class CustomerPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # 1. Fetch the latest Inquiry and Invoice
        inquiry = Inquiry.objects.filter(email__iexact=user.email).order_by('-created_at').first()
        invoice = Invoice.objects.filter(guest_email__iexact=user.email).order_by('-created_at').first()

        if not inquiry and not invoice:
            return Response({
                "first_name": user.first_name or "Guest",
                "email": user.email,
                "has_active_trip": False,
            }, status=status.HTTP_200_OK)

        if invoice and not inquiry:
            inquiry = invoice.inquiry

        # 2. Extract Confirmed Accommodation Details
        acc_data = None
        if inquiry:
            accepted_rec = inquiry.recommendations.filter(accepted=True).first()
            if accepted_rec and accepted_rec.accommodation:
                apt = accepted_rec.accommodation
                cover_img = apt.images.first()

                amenities = []
                if apt.wifi: amenities.append("High-speed WiFi")
                if apt.parking: amenities.append("Secure Parking")
                if getattr(apt, 'airport_minutes', 0): amenities.append(f"{apt.airport_minutes} mins to Airport")
                if not amenities: amenities.append("Standard Amenities")

                acc_data = {
                    "title": apt.property_name,
                    "location": apt.area,
                    "image_url": request.build_absolute_uri(
                        cover_img.image.url) if cover_img and cover_img.image else None,
                    "amenities": amenities
                }

        # 3. Format Invoice Data
        invoice_data = None
        if invoice:
            invoice_data = {
                "id": str(invoice.id),  # CRITICAL FIX: Added ID so React button works
                "invoice_number": invoice.invoice_number,
                "currency": invoice.currency,
                "accommodation_total": float(invoice.accommodation_total),
                "additional_fees": float(invoice.additional_fees),
                "grand_total": float(invoice.grand_total),
                "deposit_required": float(invoice.deposit_required),
                "balance_due": float(invoice.balance_due),
                "status": invoice.status,
                "deposit_paid": invoice.status in ['DEPOSIT_PAID', 'PAID'],
                "due_date": invoice.due_date.strftime("%d %b %Y") if invoice.due_date else None,
            }

            # 4. FIX: Bulletproof Timeline Logic
            apt_selected = acc_data is not None or (invoice and invoice.accommodation_total > 0)

            # A trip is only fully paid if the status is PAID AND the balance is physically 0
            is_fully_paid = invoice and invoice.status == 'PAID' and invoice.balance_due <= 0

            timeline = [
                {"label": "Inquiry Submitted", "done": inquiry is not None, "meta": "We received your request"},
                {"label": "Apartment Selected", "done": apt_selected,
                 "meta": acc_data["title"] if acc_data else "Awaiting your choice"},
                {"label": "Deposit Paid", "done": invoice_data["deposit_paid"] if invoice_data else False,
                 "meta": "30% required to lock dates"},
                {"label": "Fully Paid" if is_fully_paid else "Pending Balance", "done": is_fully_paid,
                 "meta": "Balance cleared" if is_fully_paid else "Awaiting final payment"},
            ]

        days_until_arrival = None
        duration = 1
        if inquiry and inquiry.arrival_date:
            delta = inquiry.arrival_date - date.today()
            days_until_arrival = max(0, delta.days)
            if inquiry.departure_date:
                calc_duration = (inquiry.departure_date - inquiry.arrival_date).days
                duration = calc_duration if calc_duration > 0 else 1

        payload = {
            "first_name": user.first_name or (inquiry.first_name if inquiry else "Guest"),
            "email": user.email,
            "has_active_trip": True,
            "days_until_arrival": days_until_arrival,
            "package_name": "Curated Concierge Stay",
            "arrival_date": inquiry.arrival_date.strftime("%d %b %Y") if inquiry and inquiry.arrival_date else None,
            "duration_nights": duration,
            "timeline": timeline,
            "accommodation": acc_data,
            "invoice": invoice_data,
        }

        return Response(payload, status=status.HTTP_200_OK)