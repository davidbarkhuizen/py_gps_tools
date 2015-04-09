from django.shortcuts import render

# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.core.urlresolvers import reverse

from django import forms
from server.models import GpxFile

# get
def app(request):
    return HttpResponseRedirect('/static/app.html')

from django.utils import simplejson
from django.core import serializers

def getMaps(request):

    gpx_files = GpxFile.objects.all()
    resp_dict = { 'maps' : []}
    for x in gpx_files:
        d = { 'name' : x.Name, 'id' : x.id }
        resp_dict['maps'].append(d)
    data = simplejson.dumps(resp_dict)
    return HttpResponse(data, mimetype='application/json')


def upload(request):
    
    # FILE UPLOAD
    #
    if request.method == 'POST':

        name = request.FILES['gpx_file'] 
        file_string = request.FILES['gpx_file'].read() 
        
        already_exists = False
        for f in GpxFile.objects.all():
            if (str(f.String) == file_string):
                already_exists = True
                break  

        if not already_exists:
            gpx_file = GpxFile(Name = name, String = file_string)
            gpx_file.save()

        # post-redirect-get
        return HttpResponseRedirect(reverse('server.views.upload'))

    # Load documents for the list page
    existing_gpx_files = GpxFile.objects.all()

    return render_to_response(
        'server/upload.html',
        {
            'files' : existing_gpx_files,
        },
        context_instance=RequestContext(request)
    )
