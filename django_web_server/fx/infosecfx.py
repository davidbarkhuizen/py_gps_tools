import hashlib

def hash_string(text):
	
	m = hashlib.sha256()
	m.update(text)
	hex_digest = m.hexdigest()

	print(hex_digest)
	print(m.digest_size)
	print(m.block_size)

	return hex_digest

	d2e79eed1a48df37451528311153338a25c1357a431799045a6e2f831e21f916

s = 'thedogatemyhomework'
h = hash_string(s)