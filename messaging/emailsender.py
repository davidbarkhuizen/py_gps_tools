from smtpclient import SMTPClient
from dal.user import User

class EmailSender(object):
	
	def __init__(self, smtp_addr, smtp_port, smtp_login, smtp_password):

		self.smtp_addr = smtp_addr 
		self.smtp_port = smtp_port 
		self.smtp_login = smtp_login 
		self.smtp_password = smtp_password 

	def send_user_confirmations(self, max_retry_count = 3):	

		# render emails
		#
		emails = []

		email_uuids = User.select_emailuuid_for_undistributed(max_retry_count)
		for email_uuid in email_uuids:

			uuid = email_uuid['uuid']
			to_addr = email_uuid['email']

			email = {}
			
			email['from_addr'] = self.smtp_login			
			email['to_addr'] = to_addr

			email['subject'] = 'confirm gpxmaps.net'

			url = 'http://www.gpxmaps.net/useractivation/?uuid={0}'.format(uuid)

			email['html'] = '<a href="{0}">click here to confirm your user @ gpxmaps.net</a>'.format(url)
			email['text'] = 'click thus link to confirm your user @ gpxmaps.net:  {0}'.format(url)
			
			emails.append(email)

		if len(emails) > 0:

			# send emails
			#
			from_addr = self.smtp_login
			mail_client = SMTPClient()
			mail_client.init(self.smtp_addr, self.smtp_port, self.smtp_login, self.smtp_password)
			
			for email in emails:
				User.increment_activation_token_distribution_try_count_for_email(email['to_addr'])
				try:
					print('%s - %s' % (email['to_addr'], email['text']))
					mail_client.send_smtpmails([email])
				except:
					continue
				User.set_activation_token_distributed_for_email(email['to_addr'])

			mail_client.terminate()
