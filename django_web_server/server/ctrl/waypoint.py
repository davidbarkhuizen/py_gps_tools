from server.models import WayPoint
from hfx import success, failure

def routing(request, qs):

	if request.method == 'DELETE':
		return delete(request, request.DELETE)

	raise Exception(request.method)

def delete(request, params):

	id = params['id']

	try:
		point = WayPoint.objects.get(id=id)
		point.delete()
		return success(None)
	except Exception as e:      
		return failure(e.message)