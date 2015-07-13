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

	def send_smtpmails(self, emails):
		'''
		emails = [{to_addr, subject, text, html}]
		'''

		for email in emails:

			msg = MIMEMultipart('alternative')
			msg['From'] = email['from_addr']
			msg['To'] = email['to_addr']
			msg['Subject'] = email['subject']

			part1 = MIMEText(email['text'], 'plain')
			part2 = MIMEText(email['html'], 'html')

			msg.attach(part1)
			msg.attach(part2)

			self.client.sendmail(email['from_addr'], email['to_addr'], msg.as_string())

	def terminate(self):
		self.client.quit()