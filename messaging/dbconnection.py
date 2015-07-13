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