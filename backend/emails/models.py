from django.db import models

# Create your models here.
class Mails(models.Model):
    message_id = models.CharField(max_length=225, unique=True)
    sender = models.EmailField()
    subject = models.CharField(max_length=225)
    body_preview = models.TextField(blank=True)
    received_date = models.DateTimeField()
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.subject} from {self.sender}'