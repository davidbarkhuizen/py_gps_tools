from django.conf.urls import patterns, url

urlpatterns = patterns('server.views',
    url(r'^upload/$', 'upload', name='upload'),
    url(r'^app/$', 'app', name='app'),
)