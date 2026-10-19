from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from .invite_views import CreateInviteView, ValidateInviteView, AcceptInviteView


router = DefaultRouter()
router.register(r'', UserViewSet, basename='account')

urlpatterns = [

    path("invites/", CreateInviteView.as_view()),
    path("invites/validate/", ValidateInviteView.as_view()),
    path("invites/accept/", AcceptInviteView.as_view()),
    path('', include(router.urls)),
]
# Don't forget to add: path('api/v1/accounts/', include('apps.accounts.urls')) to config/urls.py