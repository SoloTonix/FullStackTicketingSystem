from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Engineer(AbstractUser):
    EXPERTISE_CHOICES = (('Junior','Junior'),('Mid', 'Mid'), ('Senior', 'Senior'))
    expertise_level = models.CharField(choices=EXPERTISE_CHOICES, max_length=50, default='Junior')
    profile_pic = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username