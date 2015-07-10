import json
import time

from emailsender import EmailSender

class MessageServer(object):

	def __init__(self, db_host, database, db_user, db_password, smtp_addr, smtp_port, smtp_login, smtp_password):
		
		self.emailsender = EmailSender(db_host, database, db_user, db_password, smtp_addr, smtp_port, smtp_login, smtp_password) 

	def run(self):
		while (True):
			self.emailsender.send_user_confirmations()
			time.sleep(5) # seconds
			break

def run():

	credentials = json.load(open('credentials.json'))

	db_host = credentials['db_host']
	database = credentials['database']
	db_user = credentials['db_user']
	db_password = credentials['db_password']

	smtp_addr = credentials['smtp_addr']
	smtp_port = credentials['smtp_port']
	smtp_login = credentials['smtp_login'] 
	smtp_password = credentials['smtp_password'] 

	server = MessageServer(db_host, database, db_user, db_password, smtp_addr, smtp_port, smtp_login, smtp_password)
	server.run()

if __name__ == "__main__":
	run()