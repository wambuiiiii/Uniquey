from django.contrib import admin
from .models import Package

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'starting_price', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name', 'description')
    # Automatically populate the slug field based on the name typed by the admin
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('id', 'created_at', 'updated_at')