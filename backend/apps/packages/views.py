from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from apps.accounts.permissions import IsAdminRole
from .models import Package
from .serializers import PackageSerializer


class PackageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing travel Packages.
    """
    serializer_class = PackageSerializer
    # Default to finding a package by its slug in the URL instead of its UUID
    # e.g., /api/v1/packages/womens-safe-stay/
    lookup_field = 'slug'

    def get_queryset(self):
        """
        If a public visitor is viewing the site, only return active packages.
        If an admin is logged in, return all packages (including inactive ones).
        """
        user = self.request.user

        # Check if user is logged in AND has the admin role (or is a superuser)
        if user.is_authenticated and (getattr(user, 'role', None) == 'admin' or user.is_superuser):
            return Package.objects.all().order_by('-created_at')

        # Public visitors and standard customers only see active packages
        return Package.objects.filter(active=True).order_by('-created_at')

    def get_permissions(self):
        """
        Dynamic Permission Routing:
        Public visitors can browse packages.
        Only admins can create, edit, or delete them.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]

        # Replaced IsAdminUser with your custom RBAC gate
        return [IsAdminRole()]