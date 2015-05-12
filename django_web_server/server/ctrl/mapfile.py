from django.http import HttpResponse

import json

from logic import gpx

from server.models import GpxTrack
from server.models import WayPoint

def routing(request, qs):
    
	# if request.is_ajax():

    if request.method == 'POST':
        return post(request)

    raise Error(request.method)

def post(request):
	
	json_data = json.loads(request.body)

	file_name = None
	xml_string = None

	track = None
	way_points = None

	msg = None
	try:
		# get fileName, fileString JSON fields
		#
		try:
		    file_name = json_data['fileName']
		    xml_string = json_data['fileString']
		except Exception, e:
		    msg = 'missing json data'
		    raise

		# check if already exists
		#
		already_exists = False
		for f in GpxTrack.objects.all():
		    if str(f.xml) == str(xml_string):
		        already_exists = True
		        break
		if already_exists:
			msg = 'already exists'
			raise Exception(msg)

		# check that xml file can be parsed to either track or waypoint
		#
		try:
			track = gpx.parse_string_to_track(xml_string)
		except Exception, e:
			pass
		try:
			way_points = gpx.parse_string_to_waypoints(xml_string)
		except Exception, e:
			pass
		if (track == None) and (way_points == None):
			msg = 'file not recognised as either a track or waypoints'
			raise Exception(msg)

	# handle exception, return JSON with error code
	#	
	except Exception as e:
		
		if (msg):
			error_return = { 'code' : 'fail', 'msg' : msg }
			json_string = json.dumps(error_return)
			return HttpResponse(json_string)
		else:
			raise e

	# -----------

	ok_return = ok_return = { 'code' : 'ok' }

	# create track
	#
	if track != None:
		gpx_file = GpxTrack(xml = xml_string, name = track.name, timestamp = track.time)
		gpx_file.save()
		ok_return['id'] = gpx_file.id

	# create waypoints
	#
	if way_points != None:

		for incoming_way_point in way_points:

			wp = WayPoint(name = incoming_way_point.name.lower().strip(), lat = incoming_way_point.lat, lon = incoming_way_point.lon, ele = incoming_way_point.ele, time=incoming_way_point.time)

			already_exists = False
			matches = WayPoint.objects.filter(lat=wp.lat, lon=wp.lon, ele=wp.ele)
			if (len(matches) > 0):	
				print('%s already exists, skipping' % wp.name)
				continue

			wp.save()
			print('created point %s' % wp.name)
	
	# status response
	#
	json_string = json.dumps(ok_return)
	return HttpResponse(json_string)