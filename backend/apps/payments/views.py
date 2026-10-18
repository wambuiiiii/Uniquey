import stripe
import base64
import json
import requests
from datetime import datetime
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.accounts.permissions import IsAdminRole
from .models import Payment
from .serializers import PaymentSerializer
from apps.invoices.models import Invoice


# ---------------------------------------------------------
# 1. INTERNAL PAYMENT MANAGEMENT
# ---------------------------------------------------------
class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and manually logging Payments (Bank Transfers/Cash).
    """
    serializer_class = PaymentSerializer

    def get_permissions(self):
        # Admins manually log, edit, or delete payments
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        # Customers can view their own payment history
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin' or user.is_superuser:
            return Payment.objects.all().order_by('-payment_date')
        return Payment.objects.filter(invoice__customer__user=user).order_by('-payment_date')


# ---------------------------------------------------------
# 2. STRIPE INTEGRATION (CREDIT CARDS)
# ---------------------------------------------------------
class CreateStripePaymentIntentView(APIView):
    """
    Called by React when the user selects 'Credit Card'.
    Returns a client_secret so React can render the Stripe Elements form securely.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        invoice_id = request.data.get('invoice_id')
        try:
            invoice = Invoice.objects.get(id=invoice_id, customer__user=request.user)

            # Create a PaymentIntent with the exact amount
            intent = stripe.PaymentIntent.create(
                amount=int(invoice.balance_due * 100),  # Stripe requires cents
                currency=invoice.currency.lower(),
                metadata={'invoice_id': str(invoice.id)}  # Attach invoice ID for the webhook!
            )
            return Response({'client_secret': intent.client_secret})
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)


class StripeWebhookView(APIView):
    """
    Unprotected endpoint that listens for Stripe's 'Payment Success' ping.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the custom checkout event type
        if event['type'] == 'payment_intent.succeeded':
            intent = event['data']['object']
            invoice_id = intent.get('metadata', {}).get('invoice_id')

            if invoice_id:
                try:
                    invoice = Invoice.objects.get(id=invoice_id)
                    Payment.objects.create(
                        invoice=invoice,
                        amount=intent.get('amount') / 100,
                        payment_method='STRIPE',
                        transaction_id=intent.get('id'),
                        status='COMPLETED'
                    )
                    invoice.status = 'DEPOSIT_PAID'
                    invoice.save(update_fields=['status'])
                except Invoice.DoesNotExist:
                    pass

        return Response(status=status.HTTP_200_OK)


# ---------------------------------------------------------
# 3. M-PESA INTEGRATION (DARAJA API STK PUSH)
# ---------------------------------------------------------
class InitiateMpesaStkPushView(APIView):
    """
    Called by React when the user selects 'M-Pesa'. Triggers PIN popup on phone.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        invoice_id = request.data.get('invoice_id')
        phone_number = request.data.get('phone_number')  # Format: 2547XXXXXXXX

        try:
            invoice = Invoice.objects.get(id=invoice_id, customer__user=request.user)

            # --- Safaricom STK Push Logic ---
            # 1. Get OAuth Token (Requires CONSUMER_KEY and CONSUMER_SECRET in .env)
            auth_string = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            token_res = requests.get(
                "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {encoded_auth}"}
            )
            access_token = token_res.json().get('access_token')

            # 2. Generate Password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
            password = base64.b64encode(password_str.encode()).decode()

            # 3. Fire STK Push
            headers = {"Authorization": f"Bearer {access_token}"}
            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(invoice.balance_due),
                "PartyA": phone_number,
                "PartyB": settings.MPESA_SHORTCODE,
                "PhoneNumber": phone_number,
                "CallBackURL": "https://api.uniquey.com/api/v1/payments/webhook/mpesa/",
                "AccountReference": invoice.invoice_number,
                "TransactionDesc": "Trip Deposit"
            }

            stk_res = requests.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                json=payload, headers=headers
            )

            # We return Safaricom's CheckoutRequestID so React can show a "Waiting for PIN..." spinner
            return Response(stk_res.json())

        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)


class MpesaWebhookView(APIView):
    """
    Unprotected endpoint that listens for Safaricom's Callback after user enters PIN.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Safaricom sends raw JSON, no signature headers.
        data = request.data

        try:
            stk_callback = data['Body']['stkCallback']
            result_code = stk_callback['ResultCode']

            if result_code == 0:  # 0 means payment was successful
                # Safaricom hides data inside a CallbackMetadata array
                metadata = stk_callback['CallbackMetadata']['Item']

                amount = next(item['Value'] for item in metadata if item['Name'] == 'Amount')
                receipt_no = next(item['Value'] for item in metadata if item['Name'] == 'MpesaReceiptNumber')

                # We need to find the invoice based on an exact matching amount or wait,
                # (Normally you store the CheckoutRequestID in the database temporarily before this callback).

                print(f"M-Pesa Payment Received! Receipt: {receipt_no}, Amount: {amount}")
                # You would then create a Payment() row and update the Invoice status here.

        except KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Always return 200 so Safaricom stops retrying the callback
        return Response(status=status.HTTP_200_OK)