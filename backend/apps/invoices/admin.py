from django.contrib import admin
from .models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'get_customer_email', 'grand_total', 'status', 'due_date')
    list_filter = ('status', 'currency', 'due_date')
    search_fields = ('invoice_number', 'customer__user__email')
    readonly_fields = ('id', 'grand_total', 'deposit_required', 'balance_due', 'created_at', 'updated_at')

    def get_customer_email(self, obj):
        return obj.customer.user.email
    get_customer_email.short_description = 'Customer Email'
    get_customer_email.admin_order_field = 'customer__user__email'