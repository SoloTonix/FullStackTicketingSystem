from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('login/', LoginView.as_view(), name='TokenObtainPairView'),
    path('profile/', ProfileView.as_view(), name='ProfileView'),
    path('change-password/', ChangePasswordView.as_view(), name='ChangePasswordView'),
    path('token/refresh/', TokenRefreshView.as_view(), name='TokenRefreshView'),
]