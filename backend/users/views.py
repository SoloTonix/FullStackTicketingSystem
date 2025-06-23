from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import views
from rest_framework import permissions
from rest_framework import response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serialisers import *
from .models import *



# Create your views here.
def get_user_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh':str(refresh),
        'access':str(refresh.access_token)
    }
class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serialiser = UserSerialiser(data=request.data)
        if serialiser.is_valid():
            user = authenticate(username=serialiser.data['username'], password=serialiser.data['password'])
            if user:
                tokens = get_user_tokens(user)
                return response.Response(tokens, status=status.HTTP_201_CREATED)
            return response.Response({'error':'Invalid cridentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
class ProfileView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        engineer = get_object_or_404(Engineer, username=request.user)
        serialiser = UserSerialiser(engineer)
        return response.Response(serialiser.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serialiser = UserSerialiser(data=request.data)
        if serialiser.is_valid():
            serialiser.save()
            return response.Response(serialiser.data, status=status.HTTP_200_OK)
        return response.Response({'message':'Invalid Cridentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        engineer = get_object_or_404(Engineer, username=request.data['username'])
        serialiser = UserSerialiser(engineer, data=request.data)
        if serialiser.is_valid():
            serialiser.save()
            return response.Response(serialiser.data, status=status.HTTP_200_OK)
        return response.Response({'message':'Invalid Cridentials'}, status=status.HTTP_400_BAD_REQUEST)
    
class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request):
        old_password = request.data['password']
        new_password = request.data['new_password']
        confirm_password = request.data['confirm_password']
        
        if not request.user.check_password(old_password):
            return response.Response({'error':'Wrong Password'}, status=status.HTTP_404_NOT_FOUND)
        if new_password != confirm_password:
            return response.Response({"error": "New password and confirm password do not match."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return response.Response({'error':'Your password must of 8 characters atleast'}, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.set_password(new_password)
        request.user.save()
        
        return response.Response({'message':'Password Successfully changed'}, status=status.HTTP_201_CREATED)
        
 
        