from hfx import success, failure

from gpxlib.gpxparser import parse_gpx_xml_to_domain_model

from server.models import Gpx
from server.models import Waypoint

# exception formatting
import traceback

def routing(request, qs):
	
	if request.method == 'POST':
		return post(request, request.POST)
	if request.method == 'GET':
		return get(request, request.GET)
	if request.method == 'PATCH':
		return patch(request, request.PATCH)

	raise Exception('unsupported HTTP method:  ' + request.method)

def post(request, params):

	file_name_key = 'fileName'
	if file_name_key not in params.keys():
		return failure('no file name') 
	file_name = params[file_name_key]

	xml_key = 'xml'
	if xml_key not in params.keys():
		return failure('no xml payload') 
	xml = params[xml_key]

	if Gpx.objects.filter(xml=xml).exists() == True:
		return failure('already imported')

	try:
		gpx = parse_gpx_xml_to_domain_model(xml)
	except Exception, e:
		return failure('not a valid gpx file')

	dbModel = Gpx()
	dbModel.xml = xml
	dbModel.file_name = file_name
	dbModel.update_from_domain_model(gpx)
	
	dbModel.save()

	return success('gpx created')

def get(request, params):

	id_key = 'id'
	if id_key not in params.keys():
		return failure('no id') 
	id = params[id_key]

	model = Gpx.objects.get(id=id)    
	if (model == None):
		return failure('could not find gpx with id = %s' % id)    

	gpx = parse_gpx_xml_to_domain_model(model.xml)

	tracks = [track.to_dict() for track in gpx.tracks]     
	waypoints = [waypoint.to_dict() for waypoint in gpx.waypoints]

	info = model.to_gpx_info()

	data = { 'id' : id, 'file_name' : model.file_name, 'xml' : model.xml  }
	
	return success(data)

def patch(request, params):

	id_key = 'id'
	if id_key not in params.keys():
		return failure('no id') 
	id = params[id]

	file_name_key = 'fileName'
	if file_name_key not in params.keys():
		return failure('no file name') 
	file_name = params[file_name_key]

	xml_key = 'xml'
	if xml_key not in params.keys():
		return failure('no xml payload') 
	xml = params[xml_key]

	try:
		gpx = parse_gpx_xml_to_domain_model(xml)
	except Exception, e:
		return failure('not a valid gpx file')

	# retrieve
	#
	dbModel = Gpx.objects.get(id=id)    
	if (dbModel == None):
		return failure('could not find gpx with id = %s' % id)    

	dbModel.xml = xml
	dbModel.file_name = file_name
	updateDBModelFromDomainModel(dbModel, domainModel)

	dbModel.save()

	return success('gpx updated')