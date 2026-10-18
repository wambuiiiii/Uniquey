from django.contrib import admin
from .models import Recommendation

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_guest_name', 'get_property_name', 'sent', 'accepted', 'created_at')
    list_filter = ('sent', 'accepted', 'created_at')
    search_fields = ('inquiry__first_name', 'inquiry__last_name', 'accommodation__property_name')
    readonly_fields = ('id', 'created_at', 'updated_at')

    def get_guest_name(self, obj):
        return f"{obj.inquiry.first_name} {obj.inquiry.last_name}"
    get_guest_name.short_description = 'Guest'
    get_guest_name.admin_order_field = 'inquiry__first_name'

    def get_property_name(self, obj):
        return obj.accommodation.property_name
    get_property_name.short_description = 'Property'