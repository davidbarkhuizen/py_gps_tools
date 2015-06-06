from django.conf.urls import url

from ctrl import gpx
from ctrl import gpxinfo
from ctrl import track
from ctrl import waypoint
from ctrl import waypoints

urlpatterns = [
	url(r'^gpxinfo?(?P<qs>.+)$', gpxinfo.routing),
	url(r'^gpx?(?P<qs>.+)$', gpx.routing),
	url(r'^track?(?P<qs>.+)$', track.routing),
	url(r'^waypoints/?(?P<qs>.+)$', waypoints.routing),
	url(r'^waypoint?(?P<qs>.+)$', waypoint.routing),
	]