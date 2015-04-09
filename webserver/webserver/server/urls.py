'''
from django.conf.urls import patterns, url

urlpatterns = patterns('server.views',
    url(r'^upload/$', 'upload', name='upload'),
    #url(r'^map/$', 'map', name='map'),
    url(r'^getMaps/$', 'getMaps', name='getMaps'),
)

# /map/get/
# /maps/get/
# /mapFile/put/
'''

from django.conf.urls import url

from . import maps
from . import mmap
from . import views

urlpatterns = [
    url(r'^map/upload/index.html', mmap.upload_index),

    url(r'^maps/get/', maps.get),
    #url(r'^map/get/$', mmap.get, name=id),
    url(r'^map/get/(\d+)/$', mmap.get),
    url(r'^map/post/', mmap.post),
    ]
