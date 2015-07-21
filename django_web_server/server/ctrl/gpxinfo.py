import sys
from fx.httpfx import success, failure, mandatory_parameters, init_routing
from server.models import Gpx

def get(request, params):

	if (request.user is None):
		infos = [gpx.to_gpx_info() for gpx in Gpx.objects.filter(user=None).order_by('time')]
	else:
		infos = [gpx.to_gpx_info() for gpx in Gpx.objects.filter(user=request.user).order_by('time')]

	return success({ 'gpxinfos' : infos })

init_routing(sys.modules[__name__], __name__)