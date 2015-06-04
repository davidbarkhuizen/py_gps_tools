from hfx import success

from server.models import Gpx

def routing(request, qs):

	if request.method == 'GET':
		return get(request)

	raise Error(request.method)

def get(request):

	gpx_files = Gpx.objects.all().order_by('timestamp')

	track_list = []
	for gpx in gpx_files:
		track_info  = { 'name' : gpx.name, 'id' : gpx.id, 'timestamp' : str(gpx.timestamp) }
		track_list.append(track_info)

	return success({ 'trackInfos' : track_list })