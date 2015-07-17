from server.models import User

class Auth(object):
	
	def process_request(self, request):

		request.user = None

		auth_key = 'auth'

		if auth_key not in request.COOKIES.keys():
			return  
	
		cookie = request.COOKIES[auth_key]
	
		if not User.objects.filter(cookie_value=cookie, active=True).exists():
			return

		request.user = User.objects.get(cookie_value=cookie, active=True)

