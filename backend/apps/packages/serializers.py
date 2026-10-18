import json

from rest_framework import serializers
from .models import Package

class PackageSerializer(serializers.ModelSerializer):
    """
    Translates the Package model into JSON for the React frontend.
    Because this data is managed by trusted admins, we rely on the default
    model field validations.
    """
    class Meta:
        model = Package
        fields = [
            'id', 'name', 'tagline', 'slug', 'description', 'hero_image',
            'starting_price', 'active','audience', 'included', 'addons', 'faqs', 'seo_title',
            'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        # Convert QueryDict/FormData to standard dict
        if hasattr(data, 'dict'):
            mutable_data = data.dict()
        else:
            mutable_data = data.copy()

        # Parse JSON fields if received as stringified JSON from FormData
        for field in ['audience', 'included', 'addons', 'faqs']:
            if field in mutable_data and isinstance(mutable_data[field], str):
                try:
                    mutable_data[field] = json.loads(mutable_data[field])
                except (ValueError, TypeError):
                    pass

        return super().to_internal_value(mutable_data)