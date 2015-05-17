from django.db import models

class GpxTrack(models.Model):

	class Meta:
		db_table = "GpxTrack"

	name = models.CharField(max_length=1024)
	timestamp= models.DateField()
	xml = models.TextField()

class WayPoint(models.Model):
	'''
	<wpt lat="-23.806268" lon="30.019400">
		<ele>1101.317627</ele>
		<time>2013-12-15T04:44:54Z</time>
		<name>BRIDGE</name>
		<sym>Flag, Blue</sym>
	</wpt>
	'''

	class Meta:
		db_table = "WayPoint"

	name = models.CharField(max_length=1024)
	lat = models.DecimalField(max_digits=9, decimal_places=6)
	lon = models.DecimalField(max_digits=9, decimal_places=6)
	ele = models.DecimalField(max_digits=12, decimal_places=6)
	time = models.DateTimeField(null=True)

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