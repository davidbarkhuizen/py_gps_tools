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