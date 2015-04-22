from django.contrib import admin
admin.autodiscover()

from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns('',
    # url(r'^admin/', include(admin.site.urls)),
    (r'^', include('server.urls')),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)