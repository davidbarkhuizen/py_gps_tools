from hfx import success, failure

from gpxlib.gpxparser import parse_gpx_xml

from server.models import Gpx
from server.models import Waypoint

# exception formatting
import traceback

def routing(request, qs):
	
	if request.method == 'POST':
		return post(request, request.POST)

	if request.method == 'GET':
		return get(request, request.GET)

	raise Exception('unsupported HTTP method:  ' + request.method)

def post(request, params):

	file_name_key = 'fileName'
	if file_name_key not in params.keys():
		return failure('no file name') 
	file_name = params[file_name_key]

	xml_key = 'xml'
	if xml_key not in params.keys():
		return failure('no xml payload') 
	xml = params[xml_key]

	if Gpx.objects.filter(xml=xml).exists() == True:
		return failure('already imported')

	try:
		gpx = parse_gpx_xml(xml)
	except Exception, e:
		return failure('not a valid gpx file')

	# TODO                                                                                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvv
	# need to update track with default name from gpx file if none present in meta-data
	# assuming only 1 track, otherwise gpx file name 1, gpx file name 2, etc...

	track_names_concat = '|'.join([track.name for track in gpx.tracks]) if (len(gpx.tracks) > 0) else None

	dbGPX = Gpx(xml = xml, 
		file_name = file_name,

		name = gpx.metadata['name'],
		desc = gpx.metadata['desc'],
		time = gpx.metadata['time'],

		track_count = len(gpx.tracks),
		waypoint_count = len(gpx.waypoints),
		track_names_concat = track_names_concat
		)

	dbGPX.save()

	# create waypoints
	#
	for incoming_way_point in gpx.waypoints:

		wp = Waypoint(gpx = dbGPX,
			name = incoming_way_point.name.strip(),
			lat = incoming_way_point.lat, 
			lon = incoming_way_point.lon, 
			ele = incoming_way_point.ele, 
			time = incoming_way_point.time
			)

		if (Waypoint.objects.filter(lat=wp.lat, lon=wp.lon, ele=wp.ele).exists()):	
			print('%s already exists, skipping' % wp.name)
			continue

		wp.save()
		print('created point %s' % wp.name)
	
	return success(None)

def get(request, params):

    id = params['id']
    model = Gpx.objects.get(id=id)    
    if (model == None):
        return failure('could not find gpx with id = %s' % id)    

    gpx = parse_gpx_xml(model.xml)

    tracks = [track.to_dict() for track in gpx.tracks]     
    waypoints = [waypoint.to_dict() for waypoint in gpx.waypoints]

    info = model.to_gpx_info()

    data = { 'id' : id, 'file_name' : model.file_name, 
    	'name' : info['name'], 'desc' : info['desc'],
    	'tracks' : tracks, 'waypoints' : waypoints }
    
    return success(data)