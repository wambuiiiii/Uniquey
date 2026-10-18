from django.contrib import admin
from .models import Trip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_customer_name', 'get_property_name', 'arrival_date', 'status')
    list_filter = ('status', 'airport_pickup', 'arrival_date')
    search_fields = ('customer__user__email', 'accommodation__property_name')
    readonly_fields = ('id', 'created_at', 'updated_at')

    def get_customer_name(self, obj):
        return obj.customer.user.email

    get_customer_name.short_description = 'Customer'

    def get_property_name(self, obj):
        return obj.accommodation.property_name

    get_property_name.short_description = 'Accommodation'