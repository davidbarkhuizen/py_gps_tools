from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse

from server.models import GpxFile
from server.models import WayPoint

from django.utils import simplejson

from django.core.urlresolvers import reverse

from .. import models

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

    existing_gpx_files = GpxFile.objects.all()
    match = [x for x in existing_gpx_files if str(x.id) == id][0]

    track = gpx.parse_string_to_track(match.xml_string)
    
    # waypoints
    #
    track.calc_min_maxes()
    waypoints = WayPoint.objects.filter(lat__lte=track.max_lat, lat__gte=track.min_lat,lon__lte=track.max_lon, lon__gte=track.min_lon)

    track.waypoints = waypoints

    track_dict = gpx.track_to_dict(track)

    track_json = simplejson.dumps(track_dict)
    return HttpResponse(track_json, mimetype='application/json')

def post(request):
    
    if request.method != 'POST':
        raise Error(request.method)

    name = None
    try:
        name = request.FILES['gpx_file'] 
    except Exception, e:
        return HttpResponseRedirect(reverse('server.mmap.upload_index'))

    file_string = request.FILES['gpx_file'].read() 
    
    already_exists = False
    for f in GpxFile.objects.all():
        if (str(f.xml_string) == file_string):
            already_exists = True
            break  

    if not already_exists:
        gpx_file = GpxFile(name = name, xml_string = file_string)
        gpx_file.save()

    return HttpResponseRedirect(reverse('server.mmap.upload_index'))