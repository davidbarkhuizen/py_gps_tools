from django.shortcuts import render

# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse

from django import forms
from server.models import GpxFile

class GpxFileUploadForm(forms.Form):
    File = forms.FileField(
        label='*.gpx',
        help_text='G*rmin GPX Format'
    )

# get
def app(request):
    t = 'server/app.html'
    d = {}
    return render_to_response(t, d, context_instance=RequestContext(request))

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
