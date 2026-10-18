from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, AuditLog


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Customizing the admin to use email instead of username,
    and to display the custom 'role' field.
    """
    model = CustomUser
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']

    # Tells Django Admin how to group the fields on the edit page
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'action', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__email', 'action', 'description']
    readonly_fields = ['timestamp', 'user', 'action', 'description', 'ip_address']

    # Audit logs should never be edited or deleted to maintain security integrity
    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False