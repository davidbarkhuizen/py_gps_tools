from django.http import HttpResponse

def routing(request, qs):

    elif request.method == 'GET':
        return HttpResponse(qs)

    raise Error(request.method)