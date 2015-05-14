from server.models import WayPoint
from hfx import success, failure

def routing(request, qs):

	if request.method == 'PATCH':
		return patch(request, request.PATCH)
	elif request.method == 'DELETE':
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

def patch(request, params):

	id = params['id']
	name = params['name']

	try:
		point = WayPoint.objects.get(id=id)
		point.name = name
		point.save()
		return success(id)
	except Exception as e:      
		return failure(e.message)