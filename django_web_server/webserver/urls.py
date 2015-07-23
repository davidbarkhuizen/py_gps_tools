# disable admin for security
#
#from django.contrib import admin
#admin.autodiscover()

from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static

from fx.httpfx import html404

urlpatterns = patterns('',
	# disable admin for security
	#
    #url(r'^admin/', include(admin.site.urls)),
    (r'^', include('server.urls')),
) 
# disable media for security
#
# + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

def handler_404(request):
    return html404(request)
handler404 = handler_404