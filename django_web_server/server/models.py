from datetime import datetime 
from django.db import models

class User(models.Model):

	class Meta:
		db_table = "user"

	email				 	= models.CharField(max_length=1024)
	password 			 	= models.CharField(max_length=1024)

class ProspectiveUser(models.Model):

	class Meta:
		db_table = "prospectiveuser"

	timestamp					= models.DateTimeField(default=datetime.now)
	uuid						= models.CharField(max_length=36)

	email				 		= models.CharField(max_length=1024)
	password 			 		= models.CharField(max_length=1024)

	uuid_email_try_count		= models.IntegerField(default=0)
	uuid_email_sent_timestamp	= models.DateTimeField(null=True)

	user 						= models.ForeignKey(User, null=True)

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