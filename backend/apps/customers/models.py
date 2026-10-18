import uuid
from django.db import models
from django.conf import settings  # 1. Import settings to look up your Custom User blueprint



class Customer(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active Account'),
        ('INACTIVE', 'Suspended/Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 2. CRITICAL FIX: Swap out 'User' for settings.AUTH_USER_MODEL
    # This dynamically points the relationship to your accounts.CustomUser model
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_profile'
    )
    # NEW: Tracks which Admin is managing this guest
    assigned_to = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_customers',
        limit_choices_to={'is_staff': True}  # Ensures only Admins can be assigned
    )

    # Tracks the exact Inquiry submission that generated this customer account.
    inquiry = models.OneToOneField(
        'inquiries.Inquiry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='converted_customer'
    )

    nationality = models.CharField(max_length=80)
    phone = models.CharField(max_length=30)
    whatsapp = models.CharField(max_length=30, blank=True)

    account_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Customer Profile: {self.user.email}"