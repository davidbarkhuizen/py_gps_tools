var GPX = Object.freeze({

	XMLNS : 'http://www.topografix.com/GPX/1/1',

	RootAttributes : 
		{
			'creator':'gpxmaps.net',
			'version':'1.1',
			
			'xmlns:gpxx' : "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
			'xmlns:wptx1':"http://www.garmin.com/xmlschemas/WaypointExtension/v1",
			'xmlns:gpxtpx':"http://www.garmin.com/xmlschemas/TrackPointExtension/v1",			
			
			'xmlns:xsi':"http://www.w3.org/2001/XMLSchema-instance",
			'xsi:schemaLocation':"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"
		},
	
	XmlHeader : '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'
});