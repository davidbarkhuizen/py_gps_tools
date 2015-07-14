from smtpclient import SMTPClient
from dal.prospectiveuser import ProspectiveUser

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
		for email_uuid in ProspectiveUser.select_emailuuid_where_useridisnull_retrycountlessthan(max_retry_count):

			uuid = email_uuid['uuid']
			to_addr = email_uuid['email']

			email = {}
			
			email['from_addr'] = self.smtp_login			
			email['to_addr'] = to_addr

			email['subject'] = 'confirm gpxmaps.net'
			email['html'] = '<a href="{0}">click here to confirm your user @ gpxmaps.net</a>'.format(uuid)
			email['text'] = 'http://gpxmaps/net/confirm?uuid={0}'.format(uuid)
			
			emails.append(email)

		for email in emails:
			print(email['text'])

		# send emails
		#
		'''
		from_addr = self.smtp_login
		mail_client = SMTPClient()
		mail_client.init(self.smtp_addr, self.smtp_port, self.smtp_login, self.smtp_password)
		mail_client.send_smtpmails(emails)
		mail_client.terminate()
		'''