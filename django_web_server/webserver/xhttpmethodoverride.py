from django.http import QueryDict

# X-HTTP-Method-Override / HTTP POST Tunneling

# Random notes from Zena
# PUT and DELETE HTTP requests with Django and jQuery
# https://baxeico.wordpress.com/2014/06/25/put-and-delete-http-requests-with-django-and-jquery/

# Kenn Scribner .net rocks!
# X-HTTP-Method-Override
# http://www.endurasoft.com/Blog/post/X-HTTP-Method-Override.aspx

class XHttpMethodOverride(object):

    def process_request(self, request):

        if request.META.has_key('HTTP_X_METHODOVERRIDE'):
            http_method = request.META['HTTP_X_METHODOVERRIDE']

            if http_method.lower() == 'delete':
                request.METHOD = 'DELETE'
                request.META['REQUEST_METHOD'] = 'DELETE'
                request.DELETE = QueryDict(request.body)
        
        return None