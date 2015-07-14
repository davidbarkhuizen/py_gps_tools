from dbconnection import DBConnection

class User(object):

	@classmethod
	def truncate(cls):
		db = DBConnection.get_connection()
		db.execute('truncate table "user";')
		db.terminate()

	@classmethod
	def increment_activation_token_distribution_try_acount_for_email(cls, email):

		sql = '''
		update 'user'
		set activation_token_distribution_try_acount = activation_token_distribution_try_acount + 1
		where email = '{0}'
		;'''.format(str(max_retry_count))

		db_connxn = DBConnection.get_connection()
		db_connxn.execute()
		db_connxn.close()

	@classmethod
	def set_activation_token_distributed_for_email(cls, email):

		sql = '''
		update "user"
		set "activation_token_distributed" = now()
		where ("email" = '{0}') 
		;'''.format(email)

		db_connxn = DBConnection.get_connection()
		db_connxn.execute(sql)
		db_connxn.close()

	@classmethod
	def select_emailuuid_for_undistributed(cls, max_retry_count = 3):

		sql = '''
		select email, uuid 
		from "user" as u
		where ((u.activation_token_distributed is null) and (u.activation_token_distribution_try_acount < {0}))
		;'''.format(str(max_retry_count))

		db_connxn = DBConnection.get_connection()

		data = []
		for row in db_connxn.fetchall(sql):
			
			email = row[0]
			uuid = row[1]

			datum =  { 'uuid' : uuid, 'email' : email }
			data.append(datum)

		return data