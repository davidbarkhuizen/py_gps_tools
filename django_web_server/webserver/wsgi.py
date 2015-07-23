'''
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
'''

import os
import sys

path = '/var/www/gpxmapsnet/django'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webserver.settings")

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()