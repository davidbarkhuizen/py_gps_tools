from smtpclient import SMTPClient
from dbconnection import DBConnection

class EmailSender(object):
	
	def get_db_connection(self):
		return DBConnection(self.db_host, self.database, self.db_user, self.db_password)

	def __init__(self, db_host, database, db_user, db_password, 
		smtp_addr, smtp_port, smtp_login, smtp_password):

		self.db_host = db_host
		self.database = database
		self.db_user = db_user
		self.db_password = db_password

		self.smtp_addr = smtp_addr 
		self.smtp_port = smtp_port 
		self.smtp_login = smtp_login 
		self.smtp_password = smtp_password 

		test_db_connection = self.get_db_connection()
		test_db_connection.close()

	def send_user_confirmations(self, max_retry_count = 3):		

		db_connxn = self.get_db_connection()

		'''
		TODO - MOVE TO DAL/MODEL on EMAIL OBJECT
		'''

		# connxn.execute('truncate table prospectiveuser;')

		q_select = '''
		select email, uuid 
		from prospectiveuser as pu
		where ((pu.user_id is null) and (uuid_email_try_count < |||0|||))
		;'''
		
		q_select = q_select.replace('|||0|||', str(max_retry_count))

		rows = db_connxn.execute_fetchall(q_select)

		# render emails
		#
		emails = []
		for row in rows:

			uuid = row[1]
			to_addr = row[0]

			email = {}
			
			email['from_addr'] = self.smtp_login			
			email['to_addr'] = to_addr

			email['subject'] = 'confirm gpxmaps.net'
			email['html'] = '<a href="{0}">click here to confirm your user @ gpxmaps.net</a>'.format(uuid)
			email['text'] = '{0}'.format(uuid)
			
			emails.append(email)

		# send emails
		#
		from_addr = self.smtp_login
		mail_client = SMTPClient()
		mail_client.init(self.smtp_addr, self.smtp_port, self.smtp_login, self.smtp_password)
		mail_client.send_smtpmails(emails)
		mail_client.terminate()