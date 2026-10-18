from django.db import transaction
from decimal import Decimal
from django.apps import apps
from django.conf import settings
from .models import Invoice
from apps.notifications.services import NotificationService


class InvoiceService:
    @staticmethod
    def mark_as_sent(invoice: Invoice) -> Invoice:
        if invoice.status == 'DRAFT':
            invoice.status = 'SENT'
            invoice.save(update_fields=['status', 'updated_at'])
        return invoice

    @staticmethod
    @transaction.atomic
    def process_payment(invoice: Invoice, amount_paid: Decimal, transaction_reference: str = "") -> Invoice:
        # 1. Update Invoice Status
        if invoice.status in ['DRAFT', 'SENT']:
            invoice.status = 'DEPOSIT_PAID'
        elif invoice.status == 'DEPOSIT_PAID':
            invoice.status = 'PAID'

        invoice.save(update_fields=['status', 'updated_at'])

        # 2. Auto-Generate the Secure User Account & Customer Profile
        CustomUser = apps.get_model('accounts', 'CustomUser')
        Customer = apps.get_model('customers', 'Customer')

        first_name = invoice.guest_name.split(' ')[0]
        last_name = ' '.join(invoice.guest_name.split(' ')[1:]) if len(invoice.guest_name.split(' ')) > 1 else ''

        user, _ = CustomUser.objects.get_or_create(
            email=invoice.guest_email,
            defaults={'first_name': first_name, 'last_name': last_name, 'is_active': True}
        )

        customer, _ = Customer.objects.get_or_create(
            user=user,
            defaults={'phone': invoice.guest_phone}
        )

        # 3. Build the Portal Login URL
        # Uses FRONTEND_URL from settings (e.g., "http://localhost:3000") or defaults to localhost
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        portal_login_url = f"{frontend_url}/portal/login?email={invoice.guest_email}"

        # 4. Construct and Send the HTML Email
        email_html = (
            f"<div style='font-family: Arial, sans-serif; color: #333;'>"
            f"<h2>Payment Received!</h2>"
            f"<p>Dear {invoice.guest_name},</p>"
            f"<p>We have successfully received your payment of <b>{invoice.currency} {amount_paid}</b>. "
            f"Your apartment reservation is now officially confirmed!</p>"
            f"<p>We have automatically created a secure client portal for your upcoming trip. "
            f"You can view your full itinerary, property details, and remaining balance by logging in here:</p>"
            f"<p><a href='{portal_login_url}' style='background-color: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Access My Trip Portal</a></p>"
            f"<p><i>Note: Simply enter your email address on the login page to receive a secure One-Time Password (OTP) to your inbox. No passwords to remember!</i></p>"
            f"<p>We look forward to hosting you!<br>- UNIQUEY Concierge</p>"
            f"</div>"
        )

        NotificationService.send_guest_email(
            email=invoice.guest_email,
            title="Trip Confirmed! Payment Received.",
            message=email_html
        )

        return invoice