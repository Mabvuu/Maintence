from rest_framework import serializers

from .models import MaintenanceRequest, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
        ]


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "title",
            "description",
            "status",
            "created_by",
            "assigned_to",
            "created_at",
            "updated_at",
        ]