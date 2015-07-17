from server.models import User

class Auth(object):
	
	def process_request(self, request):

		auth_key = 'auth'

		if auth_key not in request.COOKIES.keys():
			request.user = None  
		else:
			cookie = request.COOKIES[auth_key]
			user = User.objects.get(cookie_value=cookie)
			request.user = user