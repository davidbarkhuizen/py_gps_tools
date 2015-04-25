from django.http import HttpResponse

def routing(request, qs):

    if request.method == 'GET':
        return HttpResponse(qs)

    raise Error(request.method)