from os import urandom
import binascii
import hashlib

from datetime import datetime 
from django.db import models

from fx.httpfx import AuthenticationException

class User(models.Model):

	class Meta:
		db_table = "user"

	email				 			= models.CharField(max_length=1024, unique=True, null=False)
	salt							= models.CharField(max_length=32, null=False)
	hash		 					= models.CharField(max_length=64, null=False)

	active 							= models.BooleanField(default=False, null=False)
	
	uuid							= models.CharField(max_length=36, unique=True)
	activation_token_distribution_try_acount = models.IntegerField(default=0, null=False) 
	activation_token_distributed	= models.DateField(null=True)
	activation_token_confirmed		= models.DateField(null=True)

	cookie_value					= models.CharField(max_length=64, unique=True, null=True)
	cookie_date						= models.DateField(null=True)

	def set_salt(self):
		self.salt = binascii.hexlify(urandom(16)).upper()
		# bytearray(array_alpha)		

	def salt_password(self, password):
		return self.salt + password

	def set_hash(self, password):
		
		self.set_salt()

		m = hashlib.sha256()
		salted = self.salt_password(password) 
		m.update(salted)
		hex_digest = m.hexdigest()

		self.hash = hex_digest

	def hash_matches(self, password):

		m = hashlib.sha256()
		salted = self.salt_password(password) 
		m.update(salted)
		hex_digest = m.hexdigest()

		return (self.hash == hex_digest)

	def update_cookie(self):

		self.cookie_value = binascii.hexlify(urandom(16)).upper()
		self.cookie_key = binascii.hexlify(urandom(16)).upper()
		self.cookie_date = datetime.now()

		self.save()

	@classmethod
	def construct(cls, email, password, uuid):

		user = User(email=email, uuid=uuid)
		user.set_salt()
		user.set_hash(password)

		return user

	@classmethod
	def login(cls, email, password):

		user = User.objects.get(email=email)
		
		# TODO
		# change to complex return typ
		# eliminate conditional exception-based logic 
		#
		if ((user == None) or (user.active == False) or (not user.hash_matches(password))):
			raise AuthenticationException('invalid username or password, or user is inactive')

		user.update_cookie()

		return user

	@classmethod
	def invalidate_cookie(cls, cookie_value):

		if not User.objects.filter(cookie_value=cookie_value).exists():
			raise AuthenticationException('no matching user for auth token')  

		user = User.objects.get(cookie_value=cookie_value)

		user.cookie_value = None
		user.cookie_date = None
		user.save()

		return user

class Gpx(models.Model):

	class Meta:
		db_table = "gpx"

	user                = models.ForeignKey(User)

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