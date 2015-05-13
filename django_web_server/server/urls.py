from django.conf.urls import url

from ctrl import gpxfile
from ctrl import trackinfos
from ctrl import track
from ctrl import waypoint

from ctrl import echo

urlpatterns = [
	url(r'^echo?(?P<qs>.+)$', echo.routing),

    url(r'^gpxfile?(?P<qs>.+)$', gpxfile.routing),
    url(r'^trackinfos?(?P<qs>.+)$', trackinfos.routing),
    url(r'^track?(?P<qs>.+)$', track.routing),
    url(r'^waypoint?(?P<qs>.+)$', waypoint.routing),
    ]