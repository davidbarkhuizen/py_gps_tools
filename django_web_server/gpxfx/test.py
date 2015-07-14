import unittest

from gpxparser import parse_gpx_xml_to_domain_model

metadata_only = '''
<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx
	xmlns="http://www.topografix.com/GPX/1/1"
	xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
	xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1"
	xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
	creator="eTrex 20"
	version="1.1"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">

	<metadata>
		<name>name</name>
		<desc>desc</desc>
		<time>2015-10-26T13:39:18Z</time>
	</metadata>

</gpx>
'''

multiple_tracks = '''
<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx
	xmlns="http://www.topografix.com/GPX/1/1"
	xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
	xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1"
	xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
	creator="eTrex 20"
	version="1.1"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">

	<metadata>
		<name>name</name>
		<desc>desc</desc>
		<time>2013-10-26T13:39:18Z</time>
	</metadata>
	
	<trk>
		<name>TRACK 1</name>

		<trkseg>
			<trkpt lat="-25.9381111711" lon="27.5921234395">
				<ele>1329.16</ele>
				<time>2014-10-26T11:06:15Z</time>
			</trkpt>

			<trkpt lat="-25.9381003585" lon="27.5921297260">
				<ele>1331.56</ele>
				<time>2014-10-26T11:06:25Z</time>
			</trkpt>
		</trkseg>
	</trk>

	<trk>
		<name>TRACK 2</name>

		<trkseg>
			<trkpt lat="-25.9381111711" lon="27.5921234395">
				<ele>1329.16</ele>
				<time>2014-10-26T11:06:00Z</time>
			</trkpt>

			<trkpt lat="-25.9381003585" lon="27.5921297260">
				<ele>1331.56</ele>
				<time>2014-10-26T11:06:00Z</time>
			</trkpt>

			<trkpt lat="-25.9381003585" lon="27.5921297260">
				<ele>1331.56</ele>
				<time>2014-10-26T11:06:25Z</time>
			</trkpt>
		</trkseg>
	</trk>
</gpx>
'''

waypoints_only = '''<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx
	xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" creator="eTrex 20" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">

	<metadata>
		<link href="http://www.garmin.com">
			<text>Garmin International</text>
		</link>
		<time>2012-09-16T10:02:30Z</time>
	</metadata>

	<wpt lat="-26.482695" lon="28.212483">
		<ele>1644.855591</ele>
		<time>2012-09-16T10:02:30Z</time>
		<name>START</name>
		<sym>Flag, Blue</sym>
	</wpt>

	<wpt lat="-26.470267" lon="28.197299">
		<ele>1685.437378</ele>
		<time>2012-09-16T10:59:16Z</time>
		<name>Terraces</name>
		<sym>Flag, Blue</sym>
	</wpt>

</gpx>
'''

def clean_xml(xml):
	return xml.replace('\r', '').replace('\n', '')

class GpxTests(unittest.TestCase):
	"""tests for gpx.py logic"""
	 
	def setUp(self):
		pass
	 
	def tearDown(self):
		pass
	 
	def test_parse_metadata_only(self):
		xml = clean_xml(metadata_only)
		gpx = parse_gpx_xml_to_domain_model(xml)

		metadata_keys = gpx.metadata.keys()
		self.assertEqual(len(metadata_keys), 3)

		self.assertEqual(gpx.metadata['name'], 'name')
		self.assertEqual(gpx.metadata['desc'], 'desc')
		self.assertEqual(gpx.metadata['time'].second, 18)

	def test_parse_multiple_tracks(self):
		xml = clean_xml(multiple_tracks)
		gpx = parse_gpx_xml_to_domain_model(xml)

		self.assertEqual(len(gpx.tracks), 2)

	def test_parse_waypoints(self):
		xml = clean_xml(waypoints_only)
		gpx = parse_gpx_xml_to_domain_model(xml)

		self.assertEqual(len(gpx.waypoints), 2)
		self.assertNotEqual(gpx.waypoints[0].lat, gpx.waypoints[1].lat) 

if __name__ == '__main__':
	unittest.main()