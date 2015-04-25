from django.conf.urls import url

from ctrl import mapfile
from ctrl import maplist
from ctrl import mmap

from ctrl import echo

urlpatterns = [
	url(r'^echo?(?P<qs>.+)$', echo.routing),

    url(r'^mapfile?(?P<qs>.+)$', mapfile.routing),
    url(r'^maplist?(?P<qs>.+)$', maplist.routing),
    url(r'^map?(?P<qs>.+)$', mmap.routing),
    ]