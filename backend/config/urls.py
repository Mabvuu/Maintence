from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from maintenance.views import (
    MaintenanceRequestViewSet,
    csrf_token,
    login_view,
    logout_view,
    me_view,
)

router = DefaultRouter()
router.register("requests", MaintenanceRequestViewSet, basename="request")

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/csrf/", csrf_token),
    path("api/login/", login_view),
    path("api/logout/", logout_view),
    path("api/me/", me_view),

    path("api/", include(router.urls)),
]