# http framework

from django.http import HttpResponse
import json

JSON_MIMETYPE = 'application/json'

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

	if len(missing) == 0:
		return

	msg = 'missing parameters:  ' + ','.join(missing_keys)
	return failure(msg)

def init_routing(controller_module, controller_module_name):

	supported_verbs = ['GET', 'POST', 'PATCH']

	controller_attr_names = [str(a) for a in dir(controller_module)]
	implemented_verb_names = [x.upper() for x in controller_attr_names if x.upper() in supported_verbs]

	implementation = {}

	for verb_name in implemented_verb_names:

		attr_name = [a for a in controller_attr_names if a.upper() == verb_name][0]
		implementation[verb_name] = getattr(controller_module, attr_name) 		

	def routing_fn(request, qs):

		print('in routing_fn')
		print('request')
		print(request)
		print('qs')
		print(qs)

		verb_name = request.method.upper()

		if (verb_name not in implemented_verb_names):
			msg = 'invalid http method:  %s' % verb_name
			return failure(msg) 
		else:
			return implementation[verb_name](request, getattr(request, verb_name))

	controller_module.routing = routing_fn