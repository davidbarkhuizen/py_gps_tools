import os
import json

credentials = json.load(open('/var/www/gpxmapsnet/credentials.json'))
config = json.load(open('/var/www/gpxmapsnet/config.json'))

SECRET_KEY = credentials['django_secret_key']
APPLICATION_ENTRY_POINT = config['application_entry_point']

DEBUG = True
TEMPLATE_DEBUG = True

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


ALLOWED_HOSTS = []
ROOT_URLCONF = 'webserver.urls'
WSGI_APPLICATION = 'webserver.wsgi.application'

# DIRECTORIES -------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR,  'templates'),
)

# MEDIA_ROOT = '~/data/websites/gpxmapsnet/media_root/'
# MEDIA_URL = '/MEDIA/'

STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "static"),
)

INSTALLED_APPS = (
    #disable admin for security
    #'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'server' # da sjit
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'middleware.xhttpmethodoverride.XHttpMethodOverride',
    'middleware.auth.Auth'
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': credentials['database'],
        'USER' : credentials['db_user'],
        'PASSWORD' : credentials['db_password'],
        'HOST' : credentials['db_host']
    }
}