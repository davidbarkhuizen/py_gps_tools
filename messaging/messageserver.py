import time

from emailsender import EmailSender

class MessageServer(object):

	def __init__(self, smtp_addr, smtp_port, smtp_login, smtp_password):
		
		self.emailsender = EmailSender(smtp_addr, smtp_port, smtp_login, smtp_password) 

	def run(self):
		self.emailsender.send_user_confirmations()
