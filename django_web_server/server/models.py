from django.db import models

class Gpx(models.Model):

	class Meta:
		db_table = "Gpx"

	file_name			= models.CharField(max_length=1024)
	xml 				= models.TextField()

	name 				= models.CharField(max_length=1024, null=True)
	desc 				= models.CharField(max_length=1024, null=True)
	time 				= models.DateTimeField(null=True)

	track_count			= models.IntegerField()
	track_names_concat 	= models.TextField(null=True)
	waypoint_count     	= models.IntegerField()

	# author			= models.CharField(max_length=512, null=True)
	# linkURL			= models.CharField(max_length=2048, null=True)
	# linkText			= models.CharField(max_length=512, null=True)
	# keywords			= models.CharField(max_length=512, null=True)

	def to_gpx_info(self):

		print('dog')
		print(self.time)

		return { 'id' : self.id,
			'file_name' : self.file_name,
			'name' : self.name,
			'desc' : self.desc,
			'time' : self.time.isoformat(),
			'track_count': self.track_count,
			'track_names_concat' : self.track_names_concat,
			'waypoint_count' : self.waypoint_count
		}

class Waypoint(models.Model):

	class Meta:
		db_table = "Waypoint"

	gpx = models.ForeignKey(Gpx)

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
				'gpx' : self.gpx.id,
				'name' : self.name, 
				'lat' : str(self.lat), 
				'lon' : str(self.lon),
				'ele' :  str(self.ele), 
				'time' : self.time.isoformat() 
			}