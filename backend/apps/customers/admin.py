from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('get_email', 'get_first_name', 'nationality', 'account_status', 'created_at')
    list_filter = ('account_status',)
    search_fields = ('user__email', 'user__first_name', 'phone', 'whatsapp')
    readonly_fields = ('id', 'user', 'inquiry', 'created_at', 'updated_at')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = 'First Name'