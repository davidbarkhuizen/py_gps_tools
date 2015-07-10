import psycopg2
import sys

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
	
	def get_connection(self):
		return DBConnection(self.host, self.database, self.user, self.password)

	def __init__(self, host, database, user, password):

		self.host = host
		self.database = database
		self.user = user
		self.password = password

		test_connection = self.get_connection()
		test_connection.close()		

	def send_user_confirmations(self, max_retry_count = 3):		

		q_select = '''
		select email, uuid 
		from prospectiveuser as pu
		where ((pu.user_id is null) and (uuid_email_try_count < |||0|||))
		;'''
		
		q_select = q_select.replace('|||0|||', str(max_retry_count))

		connxn = self.get_connection()

		for row in connxn.execute_fetchall(q_select):
			email = row[0]
			uuid = row[1]
			print(email, uuid)

		connxn.close()