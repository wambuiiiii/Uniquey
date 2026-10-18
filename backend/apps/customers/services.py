from .models import Customer


class CustomerService:
    """
    Business logic layer for Customer profiles.
    Account creation logic will live here later, triggered by the Payment Webhook.
    """

    @staticmethod
    def update_profile(customer: Customer, validated_data: dict) -> Customer:
        """
        Updates allowable customer profile fields (e.g., changing their WhatsApp number).
        """
        for attr, value in validated_data.items():
            setattr(customer, attr, value)

        customer.save(update_fields=list(validated_data.keys()) + ['updated_at'])
        return customer