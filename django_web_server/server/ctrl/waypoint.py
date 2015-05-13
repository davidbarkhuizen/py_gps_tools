from django.http import HttpResponse
import json

from server.models import WayPoint

def routing(request, qs):

    if request.method == 'DELETE':
        return delete(request, request.DELETE['id'])

    raise Error(request.method)

def delete(request, id):

    response = {}

    try:
        point = WayPoint.objects.get(id=id)
        point.delete()
        response['status'] = 'ok'

    except Exception as e:      
        response['status'] = 'failed'  

    json_responce_string = json.dumps(response)
    return HttpResponse(json_responce_string, mimetype='application/json')

    '''
    # waypoints
    #
    track.calc_min_maxes()
    waypoints = WayPoint.objects.filter(lat__lte=track.max_lat, lat__gte=track.min_lat,lon__lte=track.max_lon, lon__gte=track.min_lon)

    track_json_string = json.dumps(track_dict)
    return HttpResponse(track_json_string, mimetype='application/json')
    '''