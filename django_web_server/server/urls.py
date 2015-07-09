from django.conf.urls import url

from ctrl import gpx
from ctrl import gpxinfo
from ctrl import prospectiveuser

urlpatterns = [
	url(r'^prospectiveuser?(?P<qs>.+)$', prospectiveuser.routing),
	url(r'^gpxinfo?(?P<qs>.+)$', gpxinfo.routing),
	url(r'^gpx?(?P<qs>.+)$', gpx.routing),
	]