from server.models import WayPoint
from hfx import success, failure

def routing(request, qs):

    if request.method == 'DELETE':
        return delete(request, request.DELETE['id'])

    raise Error(request.method)

def delete(request, id):

    try:
        point = WayPoint.objects.get(id=id)
        point.delete()
        return success()
    except Exception as e:      
        return failure()