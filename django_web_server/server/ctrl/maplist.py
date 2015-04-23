from django.http import HttpResponse
from django.utils import simplejson

from server.models import GpxFile

def routing(request, qs):

    #xyz = request.GET.get('xyz', 'default value if not found')

    # if request.is_ajax():
    if request.method == 'GET':
        return get(request)

    raise Error(request.method)

def get(request):

    gpx_files = GpxFile.objects.all()

    maps = []
    for x in gpx_files:
        m = { 'name' : x.name, 'id' : x.id }
        maps.append(m)

    python = { 'maps' : maps }

    json = simplejson.dumps(python)

    return HttpResponse(json, mimetype='application/json')
