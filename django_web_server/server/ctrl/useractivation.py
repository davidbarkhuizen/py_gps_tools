import sys
import uuid
from fx.httpfx import success, failure, mandatory_parameters, init_routing

from server.models import User

@mandatory_parameters(['email', 'password'])
def post(request, params):

	email = params['email']
	password = params['password']

	# email already exists
	#
	if User.objects.filter(email=email).exists() == True:
		
		user = User.objects.get(email=email)

		if user.active == True:
			return failure('an active user with this email already exists.')
		elif user.activation_token_confirmed is not None:
			return failure('user has already been confirmed. all you need to do now is log in.')		 
		elif user.activation_token_distributed is not None:
			return failure('a confirmation email has already sent. check your email and click the link to confirm.')
		else:
			return failure('although this user is registered, we have been unable to send a confirmation email')

	# ---------------------------------------------------

	# validate
	# - email
	# - password

	unassigned_uuid = None
	while (unassigned_uuid is None):

		candidate_uuid = uuid.uuid4()
		if not User.objects.filter(uuid=candidate_uuid).exists():
			unassigned_uuid = candidate_uuid

	new_pu = User.construct(email, password, unassigned_uuid)
	new_pu.save()

	return success('user registered.  click on email link to confirm.')

# confirm prospective user
# unauth
#
def get(request, params):
	raise 'NYE'

init_routing(sys.modules[__name__], __name__)