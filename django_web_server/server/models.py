from datetime import datetime 
from django.db import models

class User(models.Model):

	class Meta:
		db_table = "user"

	email				 			= models.CharField(max_length=1024, unique=True, null=False)
	password_hash_salt				= models.CharField(max_length=16)
	password_hash		 			= models.CharField(max_length=64, null=False)
	active 							= models.BooleanField(default=True, null=False)

	activation_token				= models.CharField(max_length=36, unique=True)
	activation_token_distribution_try_acount = models.IntegerField(default=0, null=False) 
	activation_token_distributed	= models.DateField(null=True)
	activation_token_confirmed		= models.DateField(null=True)

class Gpx(models.Model):

	class Meta:
		db_table = "gpx"

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

		self.name = domain_model.metadata['name']
		self.desc = domain_model.metadata['desc']
		self.time = domain_model.metadata['time']

		# TRACK

		self.track_count = len(domain_model.tracks)

		track_names_concat = '|'.join([track.name for track in domain_model.tracks]) if (len(domain_model.tracks) > 0) else None
		self.track_names_concat = track_names_concat

		# WAYPOINT
		
		self.waypoint_count = len(domain_model.waypoints)