import json

from messaging.messageserver import MessageServer
from dal.dbconnection import DBConnection

def run():

	credentials = json.load(open('credentials.json'))

	db_host = credentials['db_host']
	database = credentials['database']
	db_user = credentials['db_user']
	db_password = credentials['db_password']

	DBConnection.configure(db_host, database, db_user, db_password)

	smtp_addr = credentials['smtp_addr']
	smtp_port = credentials['smtp_port']
	smtp_login = credentials['smtp_login'] 
	smtp_password = credentials['smtp_password'] 

	server = MessageServer(smtp_addr, smtp_port, smtp_login, smtp_password)
	server.run()

if __name__ == "__main__":
	run()