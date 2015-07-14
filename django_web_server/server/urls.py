from django.conf.urls import url

from ctrl import gpx
from ctrl import gpxinfo
from ctrl import useractivation

urlpatterns = [
	url(r'^useractivation?(?P<qs>.+)$', useractivation.routing),
	url(r'^gpxinfo?(?P<qs>.+)$', gpxinfo.routing),
	url(r'^gpx?(?P<qs>.+)$', gpx.routing),
	]