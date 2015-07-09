from hfx import success, failure

from server.models import ProspectiveUser

def routing(request, qs):
	
	if request.method == 'POST':
		return post(request, request.POST)
	if request.method == 'GET':
		return get(request, request.GET)

	# if request.method == 'PATCH':
	# 	return patch(request, request.PATCH)

	raise Exception('unsupported HTTP method:  ' + request.method)

# create prospective user
# unauth
#
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

# confirm prospective user
# unauth
#
def get(request, params):

	id_key = 'id'
	if id_key not in params.keys():
		return failure('no id') 
	id = params[id_key]

	model = Gpx.objects.get(id=id)    
	if (model == None):
		return failure('could not find gpx with id = %s' % id)    

	gpx = parse_gpx_xml_to_domain_model(model.xml)
	
	data = { 'id' : id, 'file_name' : model.file_name, 'xml' : model.xml  }
	
	return success(data)
