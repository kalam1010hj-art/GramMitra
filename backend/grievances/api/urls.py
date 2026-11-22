from django.urls import path
from .views import (
    AttachmentView,
    GrievanceView,
    GrievanceDetailsView,
    GrievanceUpdateView,
)

urlpatterns = [
    path("<int:pk>/attachment", AttachmentView.as_view()),
    path("", GrievanceView.as_view()),
    path("<int:pk>", GrievanceDetailsView.as_view()),
    path("post-update", GrievanceUpdateView.as_view()),
]
