from django.db import models
from users.models import *
# Create your models here.
class Store(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=500, null=True, blank=True)
    email = models.EmailField(max_length=200, null=True, blank=True)
    admin = models.CharField(max_length=200, null=True, blank=True)
    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name 
class Issue(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    created_by = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='created_tickets')
    assigned_to = models.ForeignKey(Engineer, on_delete=models.SET_NULL, null=True, related_name='assigned_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    

class Ticket(models.Model):
    rsnl_id = models.CharField(max_length=700, null=True, blank=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class Comment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    
    