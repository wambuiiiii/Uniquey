from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='account')

urlpatterns = [
    path('', include(router.urls)),
]
# Don't forget to add: path('api/v1/accounts/', include('apps.accounts.urls')) to config/urls.py