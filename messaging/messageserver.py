import time

from emailsender import EmailSender

class MessageServer(object):

	def __init__(self, host, database, user, password):
		
		self.emailsender = EmailSender(host, database, user, password) 

	def run(self):
		while (True):
			self.emailsender.send_user_confirmations()
			time.sleep(5) # seconds
			break

def run():
	host = 'localhost'
	database = 'gpxmapsnet'
	user = 'orm'
	password = 'password'
	server = MessageServer(host, database, user, password)
	server.run()

if __name__ == "__main__":
	run()