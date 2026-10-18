from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from apps.accounts.permissions import IsAdminRole
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing Invoices and M-Pesa Payments.
    """
    serializer_class = InvoiceSerializer

    def get_permissions(self):
        """
        Guests must be able to view their invoice, trigger M-Pesa, and Safaricom
        needs to send the callback without authentication.
        """
        if self.action in ['retrieve', 'pay_with_mpesa', 'mpesa_callback']:
            return [AllowAny()]
        return [IsAdminRole()]

    def get_queryset(self):
        """
        Admins view all invoices. Guests only retrieve specific invoices using
        the unguessable UUID link.
        """
        return Invoice.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """
        Creates the invoice. Mathematical logic is handled directly in models.py save().
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = serializer.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(invoice).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def pay_with_mpesa(self, request, pk=None):
        invoice = self.get_object()
        phone = request.data.get('phone')

        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Determine the exact amount to charge
        amount_to_pay = invoice.balance_due if invoice.status == 'DEPOSIT_PAID' else invoice.deposit_required

        try:
            from .mpesa import DarajaService
            # Pass the specific amount to the Daraja service
            res = DarajaService.trigger_stk_push(invoice, phone, amount_to_pay)

            if str(res.get('ResponseCode')) == '0':
                return Response({"success": True, "message": "M-Pesa prompt sent to phone!"})
            else:
                return Response(
                    {"error": "Failed to trigger M-Pesa", "details": res},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def mpesa_callback(self, request, pk=None):
        """
        Triggered automatically by Safaricom when the guest enters their PIN.
        """
        try:
            invoice = self.get_object()

            callback_data = request.data.get('Body', {}).get('stkCallback', {})
            result_code = callback_data.get('ResultCode')

            if str(result_code) == '0':
                # Payment was successful! Process the status update.
                from .services import InvoiceService
                InvoiceService.process_payment(invoice, invoice.deposit_required)
                print(f"[M-Pesa] Payment successfully processed for Invoice {invoice.invoice_number}")
            else:
                desc = callback_data.get('ResultDesc', 'Unknown Error')
                print(f"[M-Pesa] Payment failed/cancelled for Invoice {invoice.invoice_number}: {desc}")

        except Exception as e:
            # We MUST catch all errors here and print them to the terminal.
            # If we let Django throw a 500, Safaricom will aggressively retry the webhook.
            import traceback
            print("\n" + "=" * 50)
            print(f"🚨 [M-PESA CALLBACK CRASHED]: {str(e)}")
            traceback.print_exc()
            print("=" * 50 + "\n")

        # Safaricom strictly requires this exact success payload immediately so they stop retrying
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})