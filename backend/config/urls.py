"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.accounts.views import RequestOTPView, VerifyOTPView

urlpatterns = [
    path('admin/', admin.site.urls),
# JWT Authentication Endpoints
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# Guest (Passwordless) Login
    path('api/v1/auth/otp/request/', RequestOTPView.as_view(), name='otp_request'),
    path('api/v1/auth/otp/verify/', VerifyOTPView.as_view(), name='otp_verify'),
# Mount the inquiries API at the versioned endpoint
# NEW: Accounts endpoint (for /api/v1/accounts/me/)
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/inquiries/', include('apps.inquiries.urls')),
    path('api/v1/customer/', include('apps.customers.urls')),
    path('api/v1/properties/', include('apps.properties.urls')),
    path('api/v1/packages/', include('apps.packages.urls')),
    path('api/v1/recommendations/', include('apps.recommendations.urls')),
    path('api/v1/invoices/', include('apps.invoices.urls')),
path('api/v1/payments/', include('apps.payments.urls')),
path('api/v1/trips/', include('apps.trips.urls')),
path('api/v1/notifications/', include('apps.notifications.urls')),
]
#
# # Serve media uploads during local development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#
# # TokenObtainPairView: We did not have to write a custom login view. This built-in view takes a username (which acts as the email in our custom user model) and password, verifies them against the database, and securely cryptographically signs a JWT.