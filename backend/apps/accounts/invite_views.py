from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import StaffInvite, hash_token

User = get_user_model()
INVALID = "This invite link is invalid or has expired."


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "admin")


class InviteThrottle(AnonRateThrottle):
    scope = "invite"


class CreateInviteView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"detail": "Email is required."}, status=400)
        if User.objects.filter(email__iexact=email).exists():
            return Response({"detail": "An account with this email already exists."}, status=400)

        invite, raw = StaffInvite.create_for(email, "admin", request.user)
        link = f"{settings.FRONTEND_URL}/admin-auth/accept-invite?token={raw}"

        send_mail(
            "You're invited to the UNIQUEY admin console",
            f"You've been invited to join UNIQUEY as staff.\n\n"
            f"Set up your account here (expires in 3 days):\n{link}\n",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=True,
        )
        # Returned so you can also share it by WhatsApp if email isn't set up yet
        return Response({"email": email, "invite_link": link, "expires_at": invite.expires_at}, status=201)


class ValidateInviteView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [InviteThrottle]

    def get(self, request):
        invite = StaffInvite.find(request.query_params.get("token", ""))
        if not invite or not invite.is_valid:
            return Response({"detail": INVALID}, status=400)
        return Response({"email": invite.email})


class AcceptInviteView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [InviteThrottle]

    def post(self, request):
        token = request.data.get("token", "")
        first_name = (request.data.get("first_name") or "").strip()
        last_name = (request.data.get("last_name") or "").strip()
        password = request.data.get("password") or ""

        if not first_name or not last_name:
            return Response({"detail": "First and last name are required."}, status=400)

        with transaction.atomic():
            invite = (
                StaffInvite.objects.select_for_update()
                .filter(token_hash=hash_token(token)).first()
            )
            if not invite or not invite.is_valid:
                return Response({"detail": INVALID}, status=400)
            if User.objects.filter(email__iexact=invite.email).exists():
                return Response({"detail": "An account with this email already exists."}, status=400)

            try:
                validate_password(password)
            except ValidationError as e:
                return Response({"detail": " ".join(e.messages)}, status=400)

            User.objects.create_user(
                email=invite.email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=invite.role,
            )
            invite.accepted_at = timezone.now()
            invite.save(update_fields=["accepted_at"])

        return Response({"detail": "Account created. You can now sign in."}, status=201)