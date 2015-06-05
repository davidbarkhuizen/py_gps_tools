from hfx import success, failure

from gpx.gpxparser import parse_gpx_xml

from server.models import Gpx
from server.models import WayPoint

# exception formatting
import traceback

def routing(request, qs):
	
	if request.method == 'POST':
		return post(request, request.POST)

	raise Error(request.method)

def post(request, params):

	fileNameKey = 'fileName'
	if fileNameKey not in params.keys():
		return failure('no file name') 
	fileName = params[fileNameKey]

	xmlKey = 'xml'
	if xmlKey not in params.keys():
		return failure('no xml payload') 
	xml = params[xmlKey]

	if Gpx.objects.filter(xml=xml).exists():
		return failure('already imported.')

	try:
		gpx = parse_gpx_xml(xml)
	except Exception, e:
		return failure('not a valid gpx file')

	# need to update track with default name from gpx file if none present in meta-data
	# assuming only 1 track, otherwise gpx file name 1, gpx file name 2, etc...

	gpx = Gpx(xml = xml, name = gpx.metadata['name'], time = gpx.metadata['time'])
	gpx.save()

	# create waypoints
	#
	if gpx.waypoints != None:

		for incoming_way_point in gpx.waypoints:

			wp = WayPoint(name = incoming_way_point.name.lower().strip(), lat = incoming_way_point.lat, lon = incoming_way_point.lon, ele = incoming_way_point.ele, time=incoming_way_point.time)

			already_exists = False
			matches = WayPoint.objects.filter(lat=wp.lat, lon=wp.lon, ele=wp.ele)
			if (len(matches) > 0):	
				print('%s already exists, skipping' % wp.name)
				continue

			wp.save()
			print('created point %s' % wp.name)
	
	return success(None)