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