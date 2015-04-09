from django.db import models

class GpxFile(models.Model):

	class Meta:
	    db_table = "GpxFile"

	name = models.CharField(max_length=1024)
	xml_string = models.TextField()
