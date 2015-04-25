from django.http import HttpResponse
import json

from server.models import GpxTrack

def routing(request, qs):

    #xyz = request.GET.get('xyz', 'default value if not found')

    # if request.is_ajax():
    if request.method == 'GET':
        return get(request)

    raise Error(request.method)

def get(request):

    gpx_files = GpxTrack.objects.all().order_by('timestamp')

    maps = []
    for x in gpx_files:
        m = { 'name' : x.name, 'id' : x.id, 'timestamp' : str(x.timestamp) }
        maps.append(m)

    python = { 'maps' : maps }

    json_string = json.dumps(python)

    return HttpResponse(json_string, mimetype='application/json')
