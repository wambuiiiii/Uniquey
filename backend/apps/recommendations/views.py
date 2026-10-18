from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Recommendation
from .serializers import RecommendationSerializer
from .services import RecommendationService
from apps.accounts.permissions import IsAdminRole


class RecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        queryset = (
            Recommendation.objects
            .select_related('inquiry', 'accommodation')
            .prefetch_related('accommodation__images')
            .order_by('-created_at')
        )
        inquiry_id = self.request.query_params.get('inquiry')
        if inquiry_id:
            queryset = queryset.filter(inquiry_id=inquiry_id)
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'accept']:
            return [AllowAny()]
        return [IsAdminRole()]

    def create(self, request, *args, **kwargs):
        """
        Prevent duplicate recommendations. If the apartment was already
        sent to this specific inquiry, return the existing one.
        """
        inquiry_id = request.data.get('inquiry')
        accommodation_id = request.data.get('accommodation')

        existing = Recommendation.objects.filter(inquiry_id=inquiry_id, accommodation_id=accommodation_id).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        recommendation = self.get_object()
        updated_recommendation = RecommendationService.accept_recommendation(recommendation)
        serializer = self.get_serializer(updated_recommendation)

        return Response({
            "success": True,
            "message": "Property selected successfully. We are preparing your invoice.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)