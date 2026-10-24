import base64
import math

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
    def trigger_stk_push(invoice, phone_number, amount_to_pay):
        access_token = DarajaService.get_access_token()
        api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

        # Pull credentials securely from environment variables
        shortcode = getattr(settings, 'MPESA_SHORTCODE', '174379')
        passkey = getattr(settings, 'MPESA_PASSKEY', 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919')
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

        password_str = f"{shortcode}{passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode('utf-8')

        real_amount = math.ceil(float(amount_to_pay))
        amount_to_send = 1  # Keep at 1 for Sandbox testing

        # Dynamically uses Ngrok locally, or Northflank in production
        # Safely fetch the URL. If it's completely empty in the .env, force the live domain.
        base_url = getattr(settings, 'BASE_API_URL', None)

        if not base_url:
            base_url = 'https://api.uniqueytravels.com'

        base_url = base_url.rstrip('/')
        callback_url = f"{base_url}/api/v1/invoices/{invoice.id}/mpesa_callback/"

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount_to_send,
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": str(invoice.invoice_number)[:12],
            "TransactionDesc": "UNIQUEY Booking"
        }

        try:
            response = requests.post(api_url, json=payload, headers=headers)
            response_data = response.json()

            print("\n=== DARAJA STK PUSH RESPONSE ===")
            print(f"Callback URL Used: {callback_url}")
            print(f"Daraja Response: {response_data}")
            print("================================\n")

            return response_data
        except Exception as e:
            print(f"CRITICAL DARAJA CRASH: {str(e)}")
            return {"errorMessage": str(e)}