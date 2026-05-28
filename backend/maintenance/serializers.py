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

    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.STAFF),
        source="assigned_to",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "created_by",
            "assigned_to",
            "assigned_to_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
        ]