from django.conf.urls import url

from ctrl import login
from ctrl import gpx
from ctrl import gpxinfo
from ctrl import useractivation

urlpatterns = [
	url(r'^gpxinfo?(?P<qs>.+)$', gpxinfo.routing),
	url(r'^gpx?(?P<qs>.+)$', gpx.routing),
	url(r'^useractivation?(?P<qs>.+)$', useractivation.routing),
	url(r'^login?(?P<qs>.+)$', login.routing),
	]