from django.urls import path
from .views import GrievanceView,GrievanceDetailsView,GrievanceUpdateView

urlpatterns = [
    path("",GrievanceView.as_view()),
    path("<int:pk>",GrievanceDetailsView.as_view()),
    path("post-update",GrievanceUpdateView.as_view())
]
