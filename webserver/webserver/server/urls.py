from django.conf.urls import url

from . import mapfile

from . import maps
from . import mmap
from . import views

urlpatterns = [

    url(r'^mapfile/', mapfile.routing),

    url(r'^maps/get/', maps.get),
    url(r'^map/get/(\d+)/$', mmap.get),
    url(r'^map/post/', mmap.post),
    ]
