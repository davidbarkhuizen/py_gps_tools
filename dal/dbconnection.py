import psycopg2

class DBConnection(object):

	@classmethod
	def configure(cls, host, database, user, password):
		cls.host = host 
		cls.database = database 
		cls.user = user
		cls.password = password

		cls.configured = True

	@classmethod
	def get_connection(cls):

		if (cls.configured == False):
			raise 'run .configure first'

		connection = psycopg2.connect(
			host=cls.host, 
			database=cls.database, 
			user=cls.user, 
			password=cls.password
			)    

		def execute_fetchone(sql):
			q = connection.cursor()
			q.execute(sql)          
			return q.fetchone()

		def execute_fetchall(sql):
			q = connection.cursor()
			q.execute(sql)          
			return q.fetchall()

		def execute(sql):
			q = connection.cursor()
			q.execute(sql)          
			self.connection.commit()

		def close():
			if connection is not None:
				connection.close()

		class Anonymous(object):
			pass

		connxn = Anonymous() 
		connxn.fetchone = execute_fetchone
		connxn.fetchall = execute_fetchall
		connxn.execute = execute
		connxn.close = close

		return connxn
