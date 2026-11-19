from django.urls import path
from .views import NoticeView,NoticeDetailsView
urlpatterns = [
    path("",NoticeView.as_view()),
    path("<int:pk>",NoticeDetailsView.as_view())
]
