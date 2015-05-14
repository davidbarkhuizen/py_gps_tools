from django.conf.urls import url

from ctrl import gpxfile
from ctrl import trackinfos
from ctrl import track
from ctrl import waypoint
from ctrl import waypoints

urlpatterns = [
    url(r'^gpxfile?(?P<qs>.+)$', gpxfile.routing),
    url(r'^trackinfos?(?P<qs>.+)$', trackinfos.routing),
    url(r'^track?(?P<qs>.+)$', track.routing),
    url(r'^waypoints/?(?P<qs>.+)$', waypoints.routing),
    url(r'^waypoint?(?P<qs>.+)$', waypoint.routing),
    ]