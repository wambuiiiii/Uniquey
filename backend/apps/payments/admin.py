from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'amount', 'payment_type', 'status', 'payment_date')
    list_filter = ('status', 'payment_type', 'gateway')
    search_fields = ('transaction_reference', 'invoice__invoice_number', 'invoice__customer__user__email')
    readonly_fields = ('id', 'payment_date')