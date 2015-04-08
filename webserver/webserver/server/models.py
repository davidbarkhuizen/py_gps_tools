from django.db import models

class GpxFile(models.Model):
    Name = models.CharField(max_length=1024)
    String = models.TextField()
