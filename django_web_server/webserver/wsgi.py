'''
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
'''

import os
import sys

path = '/var/www/gpxmapsnet/django_web_server'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webserver.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()