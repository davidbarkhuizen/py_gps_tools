import sys
from fx.httpfx import success, init_routing
from server.models import Gpx

def get(request, qs):

	infos = [gpx.to_gpx_info() for gpx in Gpx.objects.all().order_by('time')]
	return success({ 'gpxinfos' : infos })

init_routing(sys.modules[__name__], __name__)