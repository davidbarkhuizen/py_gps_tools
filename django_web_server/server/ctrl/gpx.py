import sys
from fx.httpfx import success, failure, init_routing
from gpxfx.gpxparser import parse_gpx_xml_to_domain_model
from server.models import Gpx

# exception formatting
import traceback

def post(request, params):

	file_name_key = 'fileName'
	if file_name_key not in params.keys():
		return failure('no file name') 
	file_name = params[file_name_key]

	xml_key = 'xml'
	if xml_key not in params.keys():
		return failure('no xml payload') 
	xml = params[xml_key]

	# --------------------------

	email_key = 'email'
	password_key = 'password'

	failed_on_missing_parameters = fail_on_missing_parameters(params, [email_key, password_key])
	if failed_on_missing_parameters:
		return failed_on_missing_parameters

	email = params[email_key]
	password = params[password_key]



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

	dbModel.save()

	return success('gpx created')

def get(request, params):

	print('params')
	print(params)

	id_key = 'id'
	if id_key not in params.keys():
		return failure('no id') 
	id = params[id_key]

	model = Gpx.objects.get(id=id)    
	if (model == None):
		return failure('could not find gpx with id = %s' % id)    

	data = { 'id' : id, 'file_name' : model.file_name, 'xml' : model.xml  }
	
	return success(data)

def patch(request, params):

	id_key = 'id'
	if id_key not in params.keys():
		return failure('no id') 
	id = params[id_key]

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

	print('gxx metadata')
	print(gpx.metadata)

	# retrieve
	#
	dbModel = Gpx.objects.get(id=id)    
	if (dbModel == None):
		return failure('could not find gpx with id = %s' % id)    

	dbModel.xml = xml
	dbModel.file_name = file_name
	dbModel.update_from_domain_model(gpx)

	print(dbModel.to_gpx_info())

	dbModel.save()

	return success('gpx updated')

init_routing(sys.modules[__name__], __name__)