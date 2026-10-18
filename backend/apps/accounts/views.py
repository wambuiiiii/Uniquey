import random
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser
from .serializers import UserSerializer
from apps.customers.models import Customer

# Best practice: define this once at the top of the file
User = get_user_model()


class UserViewSet(viewsets.GenericViewSet):
    """
    A viewset mostly used by the React frontend to fetch the current user's identity.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        GET /api/v1/accounts/me/
        React calls this immediately after login to figure out who the user is.
        """
        user = request.user

        if request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        serializer = self.get_serializer(user)
        return Response(serializer.data)


class RequestOTPView(APIView):
    """
    Generates a 6-digit code, emails it to the user, and caches it for 10 minutes.
    Automatically creates a Customer account if it's a first-time user.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Chained .lower().strip() safely to prevent 500 errors if email is None
        email = request.data.get('email', '').lower().strip()

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get or Create the User
        user, created = User.objects.get_or_create(email=email)
        if created:
            user.role = 'customer'
            user.set_unusable_password()  # Lock out standard password logins for this user
            user.save()
            # Generate the attached CRM profile immediately
            Customer.objects.get_or_create(user=user)

        # 2. Generate the 6-digit OTP
        otp_code = str(random.randint(100000, 999999))

        # 3. Store in Django's RAM Cache for 10 minutes (600 seconds)
        cache_key = f"otp_{email}"
        cache.set(cache_key, otp_code, timeout=600)

        # 4. Send the Email
        subject = "Your UNIQUEY Guest Portal Login Code"
        message = f"Welcome to UNIQUEY!\n\nYour secure login code is: {otp_code}\n\nThis code expires in 10 minutes."

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email failed to send: {e}")
            return Response({"error": "Failed to send email. Check server configuration."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    Verifies the code and returns the Access and Refresh JWTs.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Safely extract and clean inputs
        email = request.data.get('email', '').lower().strip()
        otp_input = request.data.get('otp', '').strip()

        if not email or not otp_input:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"otp_{email}"

        # 1. Retrieve the real code from the cache
        cached_otp = cache.get(cache_key)

        # 2. Check if it's expired or missing entirely
        if not cached_otp:
            return Response({"error": "The code has expired or was never requested. Please request a new one."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 3. Verify it matches (DO NOT DELETE THE CACHE YET so they can retry typos)
        if str(cached_otp) != str(otp_input):
            return Response({"error": "Invalid code. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Code is valid! Now we safely delete it so it cannot be reused
        cache.delete(cache_key)

        # 5. Issue the JWTs
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)