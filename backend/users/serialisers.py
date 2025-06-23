from rest_framework import serializers
from .models import *


class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Engineer
        fields = '__all__'
        extra_kwargs = {'password':{'write_only':True}, 'created_at':{'read_only':True}, 'updated_at':{'read_only':True}, 'profile_pic':{'read_only':True},'expertise_level':{'read_only':True}}
        
        