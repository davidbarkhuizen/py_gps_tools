from django.http import HttpResponse

from django.utils import simplejson

from server.models import GpxFile
from logic import gpx

def routing(request):
    
	# if request.is_ajax():

    if request.method == 'POST':
        return post(request)

    raise Error(request.method)

def post(request):
	
	json_data = simplejson.loads(request.body)	

	file_name = None
	xml_string = None

	msg = None
	try:
		# get fileName, fileString JSON fields
		#
		try:
		    file_name = json_data['fileName']
		    xml_string = json_data['fileString']
		except Exception, e:
		    msg = 'missing json data'
		    raise

		# check if already exists
		#
		already_exists = False
		for f in GpxFile.objects.all():
		    if str(f.xml_string) == str(xml_string):
		        already_exists = True
		        break
		if already_exists:
			msg = 'already exists'
			raise Exception(msg)

		# check that xml file can be parsed to either track or waypoint
		#
		
		track = None
		try:
			track = gpx.parse_string_to_track(xml_string)
		except:
			pass

		way_points = None

		if (track == None) and (way_points == None):
			msg = 'file not recognised as either a track or waypoints'
			raise Exception(msg)

	# handle exception, return JSON with error code
	#	
	except Exception:
		error_return = { 'code' : 'fail', 'msg' : msg }
		json_string = simplejson.dumps(error_return)
		return HttpResponse(json_string)

	gpx_file = GpxFile(name = file_name, xml_string = xml_string)
	gpx_file.save()

	ok_return = { 'code' : 'ok', 'id' : gpx_file.id }
	json_string = simplejson.dumps(ok_return)
	return HttpResponse(json_string)