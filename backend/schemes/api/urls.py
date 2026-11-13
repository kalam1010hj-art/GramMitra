from django.urls import path
from .views import SchemeView,SchemeDetailsView

urlpatterns = [
    path("",SchemeView.as_view()),
    path("<int:pk>",SchemeDetailsView.as_view())
]
