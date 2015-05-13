from server.models import GpxTrack
from server.models import WayPoint

from gpx.gpx import parse_gpx_xml_to_track
from gpx.gpx import parse_gpx_xml_to_waypoints

from hfx import success

def routing(request, qs):

    if request.method == 'POST':
        return post(request)
    elif request.method == 'GET':
        id = request.GET.get('id', '')
        return get(request, id)

    raise Exception(request.method)

def get(request, id):

    model = GpxTrack.objects.get(id=id)
    
    if (model == None):
        return failure('could not find track with id = %s' % id)    

    track = parse_gpx_xml_to_track(model.xml)
    track_dict = track.to_dict(id)    
    data = { 'track' : track_dict }
    
    return success(data)