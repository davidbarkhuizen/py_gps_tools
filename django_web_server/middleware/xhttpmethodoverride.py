from django.http import QueryDict
import json

# X-HTTP-Method-Override / HTTP POST Tunneling

# Random notes from Zena
# PUT and DELETE HTTP requests with Django and jQuery
# https://baxeico.wordpress.com/2014/06/25/put-and-delete-http-requests-with-django-and-jquery/

# Kenn Scribner .net rocks!
# X-HTTP-Method-Override
# http://www.endurasoft.com/Blog/post/X-HTTP-Method-Override.aspx

class XHttpMethodOverride(object):
	
	def process_request(self, request):

		if request.META.has_key('HTTP_X_METHODOVERRIDE'):

			http_method = request.META['HTTP_X_METHODOVERRIDE'].upper().strip() 

			if http_method in ['PUT', 'PATCH', 'DELETE']:

				request.method = http_method
				request.META['REQUEST_METHOD'] = http_method
				
				if http_method == 'PUT':
					request.PUT = json.loads(request.body)
				elif http_method == 'PATCH':
					request.PATCH = json.loads(request.body)
				elif http_method == 'DELETE':
					request.DELETE = QueryDict(request.body)

		elif request.method == 'POST':
			request.POST = json.loads(request.body)
		
		return None