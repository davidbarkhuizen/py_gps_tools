# http framework

from django.http import HttpResponse
import json

JSON_MIMETYPE = 'application/json'

html_template = '''
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>gpxmaps.net</title>
	</head>
	<body>
	<div>
		<h3>
			{0}
		</h3>
		<para>
			{1}
		</para>
	</div>
	</body>
</html>
'''

def html(header, para):

	html = html_template.format(header, para)
	return HttpResponse(html)

class AuthenticationException(Exception):
	def __init__(self, msg):
		Exception.__init__(self, msg)

def set_auth_cookie(cookie_value, lifetime_in_hours = 24):

	envelope = { 
		'status' : 'ok', 
		'data' : 'authenticated for %i hours' % lifetime_in_hours 
		}

	json_string = json.dumps(envelope)
	response = HttpResponse(json_string, mimetype=JSON_MIMETYPE)

	max_age_seconds = lifetime_in_hours * 60 * 60
	response.set_cookie("auth", value=cookie_value, max_age=max_age_seconds)
	return response

def success(data):

	envelope = { 
		'status' : 'ok', 
		'data' : data
		}

	json_string = json.dumps(envelope)
	return HttpResponse(json_string, mimetype=JSON_MIMETYPE)

def failure(message):

	envelope = { 
		'status' : message 
		}
	
	json_string = json.dumps(envelope)
	return HttpResponse(json_string, mimetype=JSON_MIMETYPE)

def fail_on_missing_parameters(parameters, keys):

	present_keys = parameters.keys()
	missing_keys = [key for key in keys if key not in present_keys]

	if len(missing_keys) == 0:
		return

	msg = 'missing parameters:  ' + ','.join(missing_keys)
	return failure(msg)

def mandatory_parameters(mandatory_params):

	def fails_on_missing_mandatory_parameters(f):

		def wrap(request, params):

			failed_on_missing_mandatory_parameters = fail_on_missing_parameters(params, mandatory_params)			
			if (failed_on_missing_mandatory_parameters):
				return failed_on_missing_mandatory_parameters
			else:
				return f(request, params)

		return wrap

	return fails_on_missing_mandatory_parameters

def init_routing(controller_module, controller_module_name):

	supported_verbs = ['GET', 'POST', 'PATCH']

	controller_attr_names = [str(a) for a in dir(controller_module)]
	implemented_verb_names = [x.upper() for x in controller_attr_names if x.upper() in supported_verbs]

	implementation = {}

	for verb_name in implemented_verb_names:

		attr_name = [a for a in controller_attr_names if a.upper() == verb_name][0]
		implementation[verb_name] = getattr(controller_module, attr_name) 		

	def routing_fn(request, qs):

		verb_name = request.method.upper()

		if (verb_name not in implemented_verb_names):
			msg = 'invalid http method:  %s' % verb_name
			return failure(msg) 
		else:
			return implementation[verb_name](request, getattr(request, verb_name))

	controller_module.routing = routing_fn