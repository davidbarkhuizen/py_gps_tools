from django.db import models

class GpxFile(models.Model):

	class Meta:
	    db_table = "GpxFile"

	name = models.CharField(max_length=1024)
	xml_string = models.TextField()

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
