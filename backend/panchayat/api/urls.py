from django.urls import path
from .views import PanchayatView

urlpatterns = [
    path("",PanchayatView.as_view())
]
