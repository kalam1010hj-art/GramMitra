from django.urls import path
from .views import UtitlityView,UtilityDetailsView,utilityScheduleView,UtilityScheduleDetailsView


urlpatterns = [
    path("",UtitlityView.as_view()),
    path("<int:pk>",UtilityDetailsView.as_view()),
    path("schedule",utilityScheduleView.as_view()),
    path("schedule/<int:pk>",UtilityScheduleDetailsView.as_view())
]
