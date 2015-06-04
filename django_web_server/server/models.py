from django.db import models

class Gpx(models.Model):

	class Meta:
		db_table = "Gpx"

	xml 				= models.TextField()
	xmlHash				= models.CharField(max_length=1024)

	# gpx meta data fields
	#
	name 				= models.CharField(max_length=512)
	desc 				= models.CharField(max_length=1024, null=True)
	#author				= models.CharField(max_length=512, null=True)
	#linkURL				= models.CharField(max_length=2048, null=True)
	#linkText			= models.CharField(max_length=512, null=True)
	time 				= models.DateField(null=True)
	#keywords			= models.CharField(max_length=512, null=True)
	# bounds
	minLat 				= models.DecimalField(max_digits=9, decimal_places=6, null=True)
	minLon 				= models.DecimalField(max_digits=9, decimal_places=6, null=True)
	maxLat 				= models.DecimalField(max_digits=9, decimal_places=6, null=True)
	maxLon 				= models.DecimalField(max_digits=9, decimal_places=6, null=True)

	# custom meta data fields
	#
	trackCount 			= models.IntegerField()
	trackNamesConcat 	= models.TextField()
	waypointCount      	= models.IntegerField()

class WayPoint(models.Model):

	class Meta:
		db_table = "WayPoint"

	name 	= models.CharField(max_length=1024)
	lat 	= models.DecimalField(max_digits=9, decimal_places=6)
	lon 	= models.DecimalField(max_digits=9, decimal_places=6)
	ele 	= models.DecimalField(max_digits=12, decimal_places=6)
	time 	= models.DateTimeField(null=True)
	# TODO sym Flag, Blue

	def __str__(self):
		return '%s (%f %f) @ %f m [%t]' % (self.name, self.lat, self.lon, self.ele, self.time)

	def to_dict(self):
		
		return { 
				'id' : self.id, 
				'name' : self.name, 
				'lat' : str(self.lat), 
				'lon' : str(self.lon),
				'ele' :  str(self.ele), 
				'time' : self.time.isoformat() 
			}