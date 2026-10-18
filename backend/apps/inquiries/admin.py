from django.contrib import admin
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the Inquiry model.
    Structured to match the 'Lead Details Page' requirements.
    """

    # Columns displayed on the main list view
    list_display = (
        'first_name',
        'last_name',
        'email',
        'arrival_date',
        'status',
        'created_at'
    )

    # Filters available on the right sidebar
    list_filter = ('status', 'purpose', 'arrival_date')

    # Fields that can be queried via the search bar
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'whatsapp')

    # Protect system-generated fields from being edited by staff
    readonly_fields = ('id', 'created_at', 'updated_at')

    # Default sorting (newest first)
    ordering = ('-created_at',)

    # Grouping fields into clean, logical sections on the detail view
    fieldsets = (
        ('Guest Information', {
            'fields': (
                'id',
                'first_name',
                'last_name',
                'email',
                'phone',
                'whatsapp',
                'nationality'
            )
        }),
        ('Travel Details', {
            'fields': (
                'arrival_date',
                'departure_date',
                'guests',
                'purpose'
            )
        }),
        ('Preferences & Budget', {
            'fields': (
                'budget_min',
                'budget_max',
                'preferred_location',
                'package',
                'special_requests'
            )
        }),
        ('System Status', {
            'fields': (
                'status',
                'created_at',
                'updated_at'
            )
        }),
    )