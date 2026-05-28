from rest_framework.permissions import BasePermission

from .models import User


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.MANAGER


class IsResident(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.RESIDENT


class IsMaintenanceStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.STAFF


class CanAccessMaintenanceRequest(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.role == User.Role.MANAGER:
            return True

        if user.role == User.Role.RESIDENT:
            return obj.created_by == user

        if user.role == User.Role.STAFF:
            return obj.assigned_to == user

        return False