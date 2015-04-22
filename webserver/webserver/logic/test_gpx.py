import unittest
import gpx

valid_waypoint_xml = '''<gpx creator="eTrex 20" version="1.1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"><metadata><link href="http://www.garmin.com"><text>Garmin International</text></link><time>2015-04-20T14:21:58Z</time></metadata><wpt lat="-26.875926" lon="28.222383"><ele>1561.704224</ele><time>2015-04-20T14:21:58Z</time><name>LOOKOUT FIRE SPOT</name><sym>Flag, Blue</sym></wpt><wpt lat="-26.871432" lon="28.221752"><ele>1547.392700</ele><time>2015-04-20T14:37:59Z</time><name>FENCE UNDERGAP</name><sym>Flag, Blue</sym></wpt><wpt lat="-26.869160" lon="28.225536"><ele>1563.850708</ele><time>2015-04-20T14:50:30Z</time><name>MOIST SPOT</name><sym>Flag, Blue</sym></wpt></gpx>'''

class Test_parse_waypoints(unittest.TestCase):

  def test_valid_file_parses_ok(self):

  	waypoints = gpx.parse_waypoints(valid_waypoint_xml)
  	self.assertEqual(len(waypoints), 3)

if __name__ == '__main__':
	unittest.main()