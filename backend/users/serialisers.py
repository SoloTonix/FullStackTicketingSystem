from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate


class LoginSerialiser(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        
        if user and user.is_active:
            data['user'] = user
            return data
        raise serializers.ValidationError('Invalid email or password')

class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Engineer
        fields = '__all__'
        extra_kwargs = {'password':{'write_only':True}, 'created_at':{'read_only':True}, 'updated_at':{'read_only':True}, 'profile_pic':{'read_only':True},'expertise_level':{'read_only':True}}
        
        