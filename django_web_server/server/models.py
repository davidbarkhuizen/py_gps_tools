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

		return { 'id' : self.id,
			'file_name' : self.file_name,
			'name' : self.name,
			'desc' : self.desc,
			'time' : self.time.isoformat() if (self.time != None) else None,
			'track_count': self.track_count,
			'track_names_concat' : self.track_names_concat,
			'waypoint_count' : self.waypoint_count
		}

	def update_from_domain_model(self, domain_model):

		# METADATA

		if (domain_model.metadata is not None):
			self.name = domain_model.metadata['name']
			self.desc = domain_model.metadata['desc']
			self.time = domain_model.metadata['time']
		else:
			self.name = ''
			self.desc = ''
			self.time = None

		# TRACK

		self.track_count = len(domain_model.tracks)

		track_names_concat = '|'.join([track.name for track in domain_model.tracks]) if (len(domain_model.tracks) > 0) else None
		self.track_names_concat = track_names_concat

		# WAYPOINT
		
		self.waypoint_count = len(domain_model.waypoints)


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