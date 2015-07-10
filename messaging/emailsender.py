import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText

class SMTPClient(object):

	def init(self, server_addr, server_port, login, password): 

		self.client = smtplib.SMTP(server_addr, server_port)

		# identify ourselves to smtp gmail client
		self.client.ehlo()

		# secure our email with tls encryption
		self.client.starttls()

		# re-identify ourselves as an encrypted connection
		self.client.ehlo()
		self.client.login(login, password)

	def send_mail(self, from_addr, to_addr, msg):
		self.client.sendmail(from_addr, to_addr, msg.as_string())

	def terminate(self):
		self.client.quit()

def send_smtpmail(server_addr, server_port, login, password, from_addr, to_addr, subject, text, html):

	client = SMTPClient()
	client.init(server_addr, server_port, login, password)

	msg = MIMEMultipart('alternative')
	msg['From'] = from_addr
	msg['To'] = to_addr
	msg['Subject'] = subject

	part1 = MIMEText(text, 'plain')
	part2 = MIMEText(html, 'html')

	msg.attach(part1)
	msg.attach(part2)

	client.send_mail(from_addr, to_addr, msg)

	client.terminate()

# ---------------------------------
import psycopg2

class DBConnection(object):

	def __init__(self, host, database, user, password):

		self.connection = psycopg2.connect(
			host=host, 
			database=database, 
			user=user, 
			password=password
			)    

	def execute_fetchone(self, sql):
		q = self.connection.cursor()
		q.execute(sql)          
		return q.fetchone()

	def execute_fetchall(self, sql):
		q = self.connection.cursor()
		q.execute(sql)          
		return q.fetchall()

	def execute(self, sql):
		q = self.connection.cursor()
		q.execute(sql)          
		self.connection.commit()

	def close(self):
		if self.connection is not None:
			self.connection.close()

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

		connxn = self.get_db_connection()

		# connxn.execute('truncate table prospectiveuser;')

		q_select = '''
		select email, uuid 
		from prospectiveuser as pu
		where ((pu.user_id is null) and (uuid_email_try_count < |||0|||))
		;'''
		
		q_select = q_select.replace('|||0|||', str(max_retry_count))

		rows = connxn.execute_fetchall(q_select)

		for row in rows:
			
			email = row[0]
			uuid = row[1]
			
			from_addr = self.smtp_login
			to_addr = email

			subject = 'confirm gpxmaps.net'
			html = '<a href="{0}">click here to confirm your user @ gpxmaps.net</a>'.format(uuid)
			text = '{0}'.format(uuid)
			send_smtpmail(self.smtp_addr, self.smtp_port, self.smtp_login, self.smtp_password, self.smtp_login, email, subject, text, html)