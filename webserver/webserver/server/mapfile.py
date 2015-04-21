from django.http import HttpResponse

from django.utils import simplejson

from server.models import GpxFile

def routing(request):
    
	# if request.is_ajax():

    if request.method == 'POST':
        return post(request)

    raise Error(request.method)

def post(request):
	
	json_data = simplejson.loads(request.body)

	

	file_name = None
	file_string = None

	msg = None
	try:
		try:
		    file_name = json_data['fileName']
		    file_string = json_data['fileString']
		except Exception, e:
		    msg = 'missing json data'
		    raise

		already_exists = False
		for f in GpxFile.objects.all():
		    if (str(f.xml_string) == file_string):
		        already_exists = True
		        break
		if (already_exists):
			msg = 'already exists'  
	except Error:
		error_return = { 'code' : 'fail', 'msg' : msg }
		jsonString = simplejson.dumps(error_return)
		return HttpResponse(jsontring)


	gpx_file = GpxFile(name = name, xml_string = file_string)
	gpx_file.save()

	return HttpResponse('ok')