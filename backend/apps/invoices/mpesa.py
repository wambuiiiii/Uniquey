import base64
import requests
from datetime import datetime
from django.conf import settings
from requests.auth import HTTPBasicAuth


class DarajaService:
    @staticmethod
    def get_access_token():
        # You will need to add these to your settings.py:
        # MPESA_CONSUMER_KEY = 'your_key'
        # MPESA_CONSUMER_SECRET = 'your_secret'
        consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
        consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')

        if not consumer_key or not consumer_secret:
            raise Exception("M-Pesa Consumer Key/Secret missing in settings.py")

        api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        r = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
        return r.json().get('access_token')

    @staticmethod
    def trigger_stk_push(invoice, phone_number,amount_to_pay):
        access_token = DarajaService.get_access_token()
        api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

        # Standard Daraja Sandbox Test Credentials
        shortcode = "174379"
        passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

        password_str = f"{shortcode}{passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode('utf-8')

        # Safaricom sandbox works best with an amount of 1 KES
        # SAFARICOM SANDBOX SAFETY NET
        # Even though we received the real 'amount_to_pay', we force it to 1 KES
        # so the sandbox doesn't crash during testing.
        # When you go live, change this to: amount = int(float(amount_to_pay))
        amount = 1

        # ⚠️ CRITICAL: Replace this with your NGROK URL while developing locally!
        ngrok_url = getattr(settings, 'NGROK_URL', 'https://your-ngrok-domain.ngrok-free.app')

        # We pass the Invoice ID directly in the Callback URL so we know exactly who paid!
        callback_url = f"{settings.BASE_API_URL}/api/v1/invoices/{invoice.id}/mpesa_callback/"
        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": invoice.invoice_number,
            "TransactionDesc": f"Deposit for {invoice.invoice_number}"
        }

        response = requests.post(api_url, json=payload, headers=headers)
        return response.json()