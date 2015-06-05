from server.models import Waypoint
from hfx import success, failure

def routing(request, qs):

    if request.method == 'GET':
        return get(request, request.GET)

    raise Error(request.method)

def get(request, params):

	waypoints = []

	# AREA QUERY
	#
	area_keys = ['minLat', 'maxLat', 'minLon', 'maxLon']
	if len([x for x in area_keys if x in params.keys()]) == len(area_keys):
		
		min_lat = params['minLat']
		max_lat = params['maxLat']
		min_lon = params['minLon']
		max_lon = params['maxLon']

		waypoints = Waypoint.objects.filter(lat__lte=max_lat, lat__gte=min_lat,lon__lte=max_lon, lon__gte=min_lon)

	wp_dicts = [wp.to_dict() for wp in waypoints]
	return success({'waypoints' : wp_dicts})
