from rest_framework import serializers
from .models import Recommendation
from ..properties.serializers import AccommodationSerializer


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = [
            'id', 'inquiry', 'accommodation',
            'recommendation_reason', 'sent', 'accepted',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Expand the accommodation UUID into the full property object (with images) when reading
        representation['accommodation'] = AccommodationSerializer(
            instance.accommodation,
            context=self.context
        ).data
        return representation