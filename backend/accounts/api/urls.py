from django.urls import path
from .views import LogoutView,PasswordView,LoginView,RegisterView,ProfileEditView

urlpatterns = [
     path("logout", LogoutView.as_view()),
     path("password", PasswordView.as_view()),
     path("login",LoginView.as_view()),
     path("register",RegisterView.as_view()),
     path("profileEdit",ProfileEditView.as_view())
]
