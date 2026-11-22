"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
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

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("utility/", include("utilites.api.urls")),
    path("panchayat/", include("panchayat.api.urls")),
    path("schemes/", include("schemes.api.urls")),
    path("accounts/", include("accounts.api.urls")),
    path("notices/", include("notices.api.urls")),
    path("grievances/", include("grievances.api.urls")),
]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from config.health import HealthView
from officials.views import (
    DirectoryView,
    EntryView,
    Dashboard,
    UsersView,
    UserAccessView,
)

urlpatterns += [
    path("health/", HealthView.as_view()),
    path("officials/", DirectoryView.as_view()),
    path("officials/<int:pk>", EntryView.as_view()),
    path("dashboard/", Dashboard.as_view()),
    path("accounts/users", UsersView.as_view()),
    path("accounts/users/<int:pk>", UserAccessView.as_view()),
]
