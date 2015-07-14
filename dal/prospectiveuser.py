from dbconnection import DBConnection

class ProspectiveUser(object):

	@classmethod
	def truncate(cls):
		db = DBConnection.get_connection()
		db.execute('truncate table prospectiveuser;')
		db.terminate()

	@classmethod
	def select_emailuuid_where_useridisnull_retrycountlessthan(cls, max_retry_count):

		db_connxn = DBConnection.get_connection()

		sql = '''
		select email, uuid 
		from prospectiveuser as pu
		where ((pu.user_id is null) and (uuid_email_try_count < |||0|||))
		;'''
		
		sql = sql.replace('|||0|||', str(max_retry_count))

		data = []
		for row in db_connxn.fetchall(sql):
			
			email = row[0]
			uuid = row[1]

			datum =  { 'uuid' : uuid, 'email' : email }
			data.append(datum)

		return data