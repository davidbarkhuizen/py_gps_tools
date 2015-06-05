from hfx import success

from server.models import Gpx

def routing(request, qs):

	if request.method == 'GET':
		return get(request)

	raise Error(request.method)

def get(request):

	infos = [gpx.to_gpx_info() for gpx in Gpx.objects.all().order_by('time')]
	return success({ 'gpxinfos' : infos })