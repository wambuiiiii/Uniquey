from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerPortalView

router = DefaultRouter()
router.register(r'', CustomerViewSet, basename='customer')

urlpatterns = [
    # Explicitly route the portal view BEFORE the router
    path('portal/', CustomerPortalView.as_view(), name='customer-portal'),

    # Let the router handle standard CRUD operations
    path('', include(router.urls)),
]