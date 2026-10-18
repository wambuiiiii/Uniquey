from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Accommodation, AccommodationImage, AccommodationBooking
from .serializers import AccommodationSerializer


class AccommodationViewSet(viewsets.ModelViewSet):
    # prefetch_related('bookings') optimizes database queries
    queryset = Accommodation.objects.all().prefetch_related('images', 'bookings').order_by('-created_at')
    serializer_class = AccommodationSerializer
    parser_classes = [MultiPartParser, FormParser,JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        accommodation = serializer.save()

        images = request.FILES.getlist('images')
        for index, img_file in enumerate(images):
            AccommodationImage.objects.create(
                accommodation=accommodation,
                image=img_file,
                is_cover=(index == 0)
            )

        return Response(self.get_serializer(accommodation).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        accommodation = serializer.save()

        images = request.FILES.getlist('images')
        for img_file in images:
            AccommodationImage.objects.create(
                accommodation=accommodation,
                image=img_file
            )

        return Response(self.get_serializer(accommodation).data)

    @action(detail=True, methods=['post'])
    def book_dates(self, request, pk=None):
        """Allows Admin to manually block dates for a property."""
        accommodation = self.get_object()
        check_in = request.data.get('check_in')
        check_out = request.data.get('check_out')


        if not check_in or not check_out:
            return Response(
                {"error": "Both check_in and check_out dates are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        AccommodationBooking.objects.create(
            accommodation=accommodation,
            check_in=check_in,
            check_out=check_out,

        )

        # Return the updated accommodation with the new booking
        return Response(self.get_serializer(accommodation).data, status=status.HTTP_201_CREATED)