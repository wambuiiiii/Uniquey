from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet,
    CreateStripePaymentIntentView,
    StripeWebhookView,
    InitiateMpesaStkPushView,
    MpesaWebhookView
)

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    # 1. Frontend API Initiators
    path('create-stripe-intent/', CreateStripePaymentIntentView.as_view(), name='create-stripe-intent'),
    path('initiate-mpesa-stk/', InitiateMpesaStkPushView.as_view(), name='initiate-mpesa'),

    # 2. Backend Webhook Receivers
    path('webhook/stripe/', StripeWebhookView.as_view(), name='webhook-stripe'),
    path('webhook/mpesa/', MpesaWebhookView.as_view(), name='webhook-mpesa'),

    # 3. Standard Payment History API
    path('', include(router.urls)),
]