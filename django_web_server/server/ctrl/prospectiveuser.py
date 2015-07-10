import uuid
from hfx import success, failure

from server.models import ProspectiveUser, User

def routing(request, qs):
	
	if request.method == 'POST':
		return post(request, request.POST)
	if request.method == 'GET':
		return get(request, request.GET)

	# if request.method == 'PATCH':
	# 	return patch(request, request.PATCH)

	raise Exception('unsupported HTTP method:  ' + request.method)

# create prospective user
# unauth
#
def post(request, params):

	email = 'email'
	if email not in params.keys():
		return failure('email') 
	file_name = params[email]

	password = 'password'
	if password not in params.keys():
		return failure('password') 
	xml = params[password]

	# ---------------------------------------------------
	# ALREADY EXISTS

	if ProspectiveUser.objects.filter(email=email).exists() == True:
		existing_prospective_user = ProspectiveUser.objects.get(email=email)

		if existing_prospective_user.user is not None:
			return failure('a confirmed user with this email already exists')
		else:
			lines = [
				'a user with this email has been created',
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