import sys
from fx.httpfx import success, failure, mandatory_parameters, init_routing, authenticated
from gpxfx.gpxparser import parse_gpx_xml_to_domain_model
from server.models import Gpx

# exception formatting
import traceback

@mandatory_parameters(['id'])
def get(request, params):
	'''
	get gpx by id
	'''

	id = params['id']

	model = Gpx.objects.get(id=id) if request.user is None else Gpx.objects.get(id=id, user=request.user)
	
	if (model == None):
		return failure('could not find gpx with id = %s' % id)    

	data = { 'id' : id, 'file_name' : model.file_name, 'xml' : model.xml  }
	
	return success(data)

@authenticated()
@mandatory_parameters(['fileName', 'xml'])
def post(request, params):
	'''
	import/create gpx
	'''

	file_name = params['fileName']
	xml = params['xml']

	# --------------------------

	if Gpx.objects.filter(xml=xml).exists() == True:
		return failure('already imported')

	gpx = None
	try:
		gpx = parse_gpx_xml_to_domain_model(xml)
	except Exception, e:
		return failure('invalid gpx')

	dbModel = Gpx()
	dbModel.xml = xml
	dbModel.file_name = file_name
	dbModel.update_from_domain_model(gpx)

	dbModel.user = request.user

	dbModel.save()

	return success('gpx created')

@authenticated()
@mandatory_parameters(['id', 'fileName', 'xml'])
def patch(request, params):
	'''
	update gpx
	'''

	id = params['id']
	file_name = params['fileName']
	xml = params['xml']

	try:
		gpx = parse_gpx_xml_to_domain_model(xml)
	except Exception, e:
		return failure('not a valid gpx file')

	if (request.user is None):
		return failure('no user. cannot update without a user.')

	# retrieve
	#
	try:
		dbModel = Gpx.objects.get(id=id, user=request.user)    
	except Error, e:
		return failure('could not find gpx with id = %s, for user' % id)    

	dbModel.xml = xml
	dbModel.file_name = file_name
	dbModel.update_from_domain_model(gpx)

	dbModel.save()

	return success('gpx updated')

init_routing(sys.modules[__name__], __name__)