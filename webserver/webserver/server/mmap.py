from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse

from server.models import GpxFile

from django.utils import simplejson

from django.core.urlresolvers import reverse

import models

def get(request, id):

    existing_gpx_files = GpxFile.objects.all()
    match = [x for x in existing_gpx_files if str(x.id) == id]
    data = simplejson.dumps({ 'name' : match[0].name } )
    return HttpResponse(data, mimetype='application/json')

def post(request):
    
    if request.method != 'POST':
        raise Error(request.method)

    name = request.FILES['gpx_file'] 
    file_string = request.FILES['gpx_file'].read() 
    
    already_exists = False
    for f in GpxFile.objects.all():
        if (str(f.xml_string) == file_string):
            already_exists = True
            break  

    if not already_exists:
        gpx_file = GpxFile(name = name, xml_string = file_string)
        gpx_file.save()

    return HttpResponseRedirect(reverse('server.mmap.upload_index'))

def upload_index(request):

    if request.method != 'GET':
        raise Error(request.method)

    existing_gpx_files = GpxFile.objects.all()

    return render_to_response('server/upload.html',
        { 'files' : existing_gpx_files, },
        context_instance=RequestContext(request)
    )

