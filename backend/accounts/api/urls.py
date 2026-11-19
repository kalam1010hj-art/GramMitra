from django.urls import path
from .views import LoginView,RegisterView,ProfileEditView

urlpatterns = [
     path("login",LoginView.as_view()),
     path("register",RegisterView.as_view()),
     path("profileEdit",ProfileEditView.as_view())
]
