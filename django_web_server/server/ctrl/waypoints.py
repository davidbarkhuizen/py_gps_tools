from server.models import WayPoint
from hfx import success, failure

def routing(request, qs):

    if request.method == 'GET':
        return get(request, request.GET)

    raise Error(request.method)

'''
# waypoints
#
track.calc_min_maxes()
waypoints = WayPoint.objects.filter(lat__lte=track.max_lat, lat__gte=track.min_lat,lon__lte=track.max_lon, lon__gte=track.min_lon)

track_json_string = json.dumps(track_dict)
return HttpResponse(track_json_string, mimetype='application/json')
'''

def get(request, params):

	area_keys = ['minLat', 'maxLat', 'minLon', 'maxLon']
	if len([x for x in area_keys if x in params.keys()]) == len(area_keys):
		
		min_lat = params['minLat']
		max_lat = params['maxLat']
		min_lon = params['minLon']
		max_lon = params['maxLon']

		waypoints = WayPoint.objects.filter(lat__lte=max_lat, lat__gte=min_lat,lon__lte=max_lon, lon__gte=min_lon)

		return success(waypoints)
