from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import MaintenanceRequest, User
from .permissions import CanAccessMaintenanceRequest
from .serializers import MaintenanceRequestSerializer, UserSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    login(request, user)

    return Response(
        {
            "detail": "Login successful.",
            "user": UserSerializer(user).data,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logout successful."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def staff_users_view(request):
    if request.user.role != User.Role.MANAGER:
        return Response(
            {"detail": "Only managers can view staff users."},
            status=status.HTTP_403_FORBIDDEN,
        )

    staff_users = User.objects.filter(role=User.Role.STAFF).order_by("username")
    return Response(UserSerializer(staff_users, many=True).data)


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [IsAuthenticated, CanAccessMaintenanceRequest]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.MANAGER:
            return MaintenanceRequest.objects.all().order_by("-created_at")

        if user.role == User.Role.STAFF:
            return MaintenanceRequest.objects.filter(assigned_to=user).order_by(
                "-created_at"
            )

        if user.role == User.Role.RESIDENT:
            return MaintenanceRequest.objects.filter(created_by=user).order_by(
                "-created_at"
            )

        return MaintenanceRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.RESIDENT:
            return Response(
                {"detail": "Only residents can create maintenance requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user

        if user.role == User.Role.RESIDENT:
            return Response(
                {"detail": "Residents cannot update requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user.role == User.Role.STAFF:
            allowed_fields = {"status"}
            sent_fields = set(request.data.keys())

            if not sent_fields.issubset(allowed_fields):
                return Response(
                    {"detail": "Staff can only update status."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["patch"])
    def assign(self, request, pk=None):
        if request.user.role != User.Role.MANAGER:
            return Response(
                {"detail": "Only managers can assign requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        maintenance_request = self.get_object()
        staff_id = request.data.get("staff_id")

        try:
            staff_user = User.objects.get(id=staff_id, role=User.Role.STAFF)
        except User.DoesNotExist:
            return Response(
                {"detail": "Maintenance staff not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        maintenance_request.assigned_to = staff_user
        maintenance_request.status = MaintenanceRequest.Status.ASSIGNED
        maintenance_request.save()

        return Response(MaintenanceRequestSerializer(maintenance_request).data)