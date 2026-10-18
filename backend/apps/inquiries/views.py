from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Inquiry
from .serializers import InquirySerializer
from .services import InquiryService

# Import the Notification Service
from apps.notifications.services import NotificationService


class InquiryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Inquiries to be viewed or created.
    """
    queryset = Inquiry.objects.all().prefetch_related('recommendations__accommodation__images').order_by('-created_at')
    serializer_class = InquirySerializer

    def get_permissions(self):
        """
        Public visitors can create inquiries and check CORS (metadata).
        Only authenticated admins can view, update, or delete them.
        """
        # 'metadata' is the action DRF uses for OPTIONS requests
        if self.action in ['create', 'metadata']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to use our Service layer
        and enforce the standard JSON response format defined in the blueprint.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate database creation to the service layer
        inquiry = InquiryService.create_inquiry(serializer.validated_data)

        # --- NEW: Trigger Admin In-App Alert ---
        NotificationService.broadcast_to_admins(
            title="New Inquiry Received",
            message=f"A new plan-my-stay request has been submitted by {inquiry.first_name} {inquiry.last_name}."
        )

        # Serialize the newly created object for the response
        response_serializer = self.get_serializer(inquiry)

        # Match the API Design Principles exactly
        return Response({
            "success": True,
            "message": "Inquiry submitted successfully.",
            "data": response_serializer.data
        }, status=status.HTTP_201_CREATED)