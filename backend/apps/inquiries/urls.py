from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InquiryViewSet

# DefaultRouter automatically generates the standard REST URLs
router = DefaultRouter()
router.register(r'', InquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
]