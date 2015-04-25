from django.http import HttpResponse
from django.utils import simplejson

#from .. import models

from server.models import GpxFile
from server.models import WayPoint

from logic import gpx

def routing(request, qs):

    id = request.GET.get('id', '')

    # if request.is_ajax():
    if request.method == 'POST':
        return post(request)
    elif request.method == 'GET':
        return get(request, id)

    raise Error(request.method)

def get(request, id):

    # retrieve matching gpx file
    #
    existing_gpx_files = GpxFile.objects.all()
    match = GpxFile.objects.get(id=id)

    # parse
    #
    track = gpx.parse_string_to_track(match.xml_string)
    
    # waypoints
    #
    track.calc_min_maxes()
    waypoints = WayPoint.objects.filter(lat__lte=track.max_lat, lat__gte=track.min_lat,lon__lte=track.max_lon, lon__gte=track.min_lon)

    track.waypoints = waypoints

    track_dict = gpx.track_to_dict(track)

    track_json = simplejson.dumps(track_dict)
    return HttpResponse(track_json, mimetype='application/json')
