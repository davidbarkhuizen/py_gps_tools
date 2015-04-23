from django.conf.urls import url

from ctrl import mapfile
from ctrl import maplist
from ctrl import mmap

urlpatterns = [

    url(r'^mapfile', mapfile.routing),
    url(r'^maplist?(?P<qs>.+)$', maplist.routing),
    url(r'^map?(?P<qs>.+)$', mmap.routing),

    ]