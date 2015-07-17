import sys
from fx.httpfx import success, failure, mandatory_parameters, init_routing, html, AuthenticationException, set_auth_cookie

from server.models import User

@mandatory_parameters(['email', 'password'])
def post(request, params):

	email = params['email']
	password = params['password']

	user = None
	try:
		user = User.login(email, password)
	except AuthenticationException, ae:
		print(ae)
		raise ae

	if (user.cookie_key is None) or (user.cookie_value is None):
		raise AuthenticationException('missing cookie')

	return set_auth_cookie(user.cookie_value) 

	# for each call, auth is checked is middleware
	# 	session auth token is extracted from cookie
	# 	looked up in user table
	#		no match => not authed (actually means breach attempt)
	#   	matches => check time period validity (creation date)

	# branch on auth status
	# 	if authed, user supplied to REST method as an argument
	# 	if not authed, null user is supplied
	# REST method privacy logic will then be user based

	# on startup, app will check for gpxsmaps.net cookie
	# 	if a cookie is found, then a test call will be made to auth controller (GET CALL)
	# 		if the test call is successful, then load proceeds as per normal
	# 		if test call is unsuccessful, then view is set to login
	#   if no cookie is found, then either go to my gpx, or go to signup


init_routing(sys.modules[__name__], __name__)