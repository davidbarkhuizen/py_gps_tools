from server.models import Gpx
from server.models import Waypoint

from gpxlib.gpxparser import parse_gpx_xml_to_domain_model

from hfx import success

def routing(request, qs):

    if request.method == 'POST':
        return post(request)
    elif request.method == 'GET':
        return get(request, request.GET)

    raise Exception(request.method)

def get(request, params):

    id = params['id']

    model = Gpx.objects.get(id=id)
    
    if (model == None):
        return failure('could not find track with id = %s' % id)    

    gpx = parse_gpx_xml_to_domain_model(model.xml)
    track_dict = gpx.tracks[0].to_dict(id)    
    data = { 'track' : track_dict }
    
    return success(data)