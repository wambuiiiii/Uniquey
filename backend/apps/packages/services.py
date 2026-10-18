from .models import Package


class PackageService:
    """
    Business logic layer for Packages.
    """

    @staticmethod
    def toggle_active_status(package: Package) -> Package:
        """
        Allows an admin to quickly hide a package from the public website
        without deleting it from the database.
        """
        package.active = not package.active
        package.save(update_fields=['active', 'updated_at'])
        return package