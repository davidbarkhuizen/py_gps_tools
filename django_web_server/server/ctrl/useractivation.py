import sys
import uuid
from fx.httpfx import success, failure, fail_on_missing_parameters, init_routing

from server.models import User

# create prospective user
# unauth
#
def post(request, params):

	email_key = 'email'
	password_key = 'password'

	failed_on_missing_parameters = fail_on_missing_parameters(params, [email_key, password_key])
	if failed_on_missing_parameters:
		return failed_on_missing_parameters

	email = params[email_key]
	password = params[password_key]

	# ---------------------------------------------------
	# ALREADY EXISTS

	if User.objects.filter(email=email).exists() == True:
		existing_prospective_user = User.objects.get(email=email)

		if existing_prospective_user.activation_token_confirmed is not None:
			return failure('an active user with this email already exists')
		else:
			lines = [
				'a user with this email has been registered',
				'but has not yet been confirmed',
				'check your email for a confirmation message',
				'click the confirmation link inside'
				];
			return failure('\n'.join(lines))

	# ---------------------------------------------------

	# validate
	# - email
	# - password

	unassigned_uuid = None
	while (unassigned_uuid is None):

		candidate_uuid = uuid.uuid4()
		if not ProspectiveUser.objects.filter(uuid=candidate_uuid).exists():
			unassigned_uuid = candidate_uuid

	new_pu = ProspectiveUser(email=email, password=password, uuid=unassigned_uuid)
	new_pu.save()

	return success('user registered.  click on email link to confirm.')

# confirm prospective user
# unauth
#
def get(request, params):
	raise 'NYE'

init_routing(sys.modules[__name__], __name__)