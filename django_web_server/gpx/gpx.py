from x import X
from point import Point
from track import Track
from waypoint import WayPoint
from segment import Segment

def def_log_fn(s):
    pass

# ---------------------------------------------------------------
# TIME

import datetime
DATE_TIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'

# https://docs.python.org/2.4/lib/datetime-tzinfo.html
#
class UTC(datetime.tzinfo):
    """UTC"""

    def utcoffset(self, dt):
        return datetime.timedelta(0)

    def tzname(self, dt):
        return "UTC"

    def dst(self, dt):
        return datetime.timedelta(0)

# Garmin GPX 1.1 Date Format 
# 2012-09-16T10:024306
# http://www.w3.org/TR/NOTE-datetime
# ISO 8601, specif7e19in UTC @ resolution = Complete date plus hours, minutes and seconds
# YYYY-MM-DDThh:mm:ssZ (eg 1997-07-16T19:20:30Z)

def parseGarmin11DateTimeString(s):

    # YYYY-MM-DDThh:mm:ssZ

    year = s[0:4]
    month = s[5:7]
    day = s[8:10]

    # http://www.w3.org/TR/NOTE-datetime
    hours = s[11:13]
    mins = s[14:16]
    secs = s[17:19]

    dt = datetime.datetime(int(year), int(month), int(day), int(hours), int(mins), int(secs), tzinfo=UTC())

    return dt

# ---------------------------------------------------------------

def blank_metadata():

    return { 'name' : None,
        'desc' : None,
        'author' : None,
        'linkURL' : None,
        'linkText' : None,
        'time' : None,
        'keywords' : None,
        'minLat' : None,
        'minLon' : None,
        'maxLat' : None,
        'maxLon' : None 
        }

def parse_metadata(find, findall):

    '''
    linkURL             = models.CharField(max_length=2048)
    linkText            = models.CharField(max_length=512)

    keywords            = models.CharField(max_length=512)

    minLat              = models.DecimalField(max_digits=9, decimal_places=6)
    minLon              = models.DecimalField(max_digits=9, decimal_places=6)
    maxLat              = models.DecimalField(max_digits=9, decimal_places=6)
    maxLon              = models.DecimalField(max_digits=9, decimal_places=6)
    '''

    metadata = blank_metadata()

    # time

    try:
        metadata_time_string = find('metadata/time').text
        metadata_time = datetime.datetime.strptime(metadata_time_string, DATE_TIME_FORMAT)    
        metadata['time'] = metadata_time
    except Error, e:
        pass

    # simple fields

    simpleFields = ['name', 'desc', 'author']

    for field in simpleFields:
        try:
            metadata[field] = find('metadata/' + field).text
        except Error, e:
            pass

    return metadata

def parse_gpx_xml(xml_string, log = def_log_fn):
    '''
    return {
        'tracks' : [],
        'waypoints' : []
    }
    '''

    x = X(xml_string)
    ns = x.ns
    def find(path): return x.find(path)
    def findall(path): return x.findall(path)

    '''
    name                = models.CharField(max_length=512)
    desc                = models.TextField()
    author              = models.CharField(max_length=512)
    linkURL             = models.CharField(max_length=2048)
    linkText            = models.CharField(max_length=512)
    time                = models.DateField()
    keywords            = models.CharField(max_length=512)
    minLat  = models.DecimalField(max_digits=9, decimal_places=6)
    minLon  = models.DecimalField(max_digits=9, decimal_places=6)
    maxLat  = models.DecimalField(max_digits=9, decimal_places=6)
    maxLon  = models.DecimalField(max_digits=9, decimal_places=6)
    '''

    # metadata time

    metadata = parse_metadata(find, findall)

    # TRACK ---------------------------------------------

    # track
    
    gpx_track = Track('', [])

    gpx_track.time = meta_data_time
    
    ## track name
    
    gpx_track.name = find('trk/name').text
    log('track name - %s' % gpx_track.name)
    
    ## track segments
    
    track_segments = findall('trk/trkseg')
    log('track segment count = %i ' % len(track_segments))
    
    for track_segment in track_segments:
        
        gpx_tracksegment = Segment([])
        
        for track_point in track_segment:
          
            lat = float(track_point.get('lat'))
            lon = float(track_point.get('lon'))
            elevation = float(track_point.find(ns + 'ele').text)
            time = datetime.datetime.strptime((track_point.find(ns + 'time').text), DATE_TIME_FORMAT)
            
            gpx_trackpoint = Point(lat, lon, elevation, time)
            
            gpx_tracksegment.points.append(gpx_trackpoint) 

        log('trackpoint count = %i' % len(gpx_tracksegment.points))

        gpx_tracksegment.points = sorted(gpx_tracksegment.points, key=lambda x : x.time)
        log('started @ %s' % gpx_tracksegment.points[0].time)
        log('ended @ %s' % gpx_tracksegment.points[len(gpx_tracksegment.points) - 1].time)  

        gpx_track.segments.append(gpx_tracksegment)

    return gpx_track

def parse_gpx_xml_to_waypoints(xml_string, log = def_log_fn):

    x = X(xml_string)
    ns = x.ns
    def find(path):
        return x.find(path)
    def findall(path):
        return x.findall(path)

    # metadata time
    metadata_time_stamp_string = find('metadata/time').text
    meta_data_time = parseGarmin11DateTimeString(metadata_time_stamp_string)    

    log('metadata - time @ %s' % meta_data_time)

    ## waypoints

    waypoints = []

    xml_waypoints = findall('wpt')
    log('way point count = %i ' % len(xml_waypoints))

    for xml_waypoint in xml_waypoints:       
          
        name = str(xml_waypoint.find(ns + 'name').text)
        lat = float(xml_waypoint.get('lat'))
        lon = float(xml_waypoint.get('lon'))
        elevation = float(xml_waypoint.find(ns + 'ele').text)
        time = parseGarmin11DateTimeString(xml_waypoint.find(ns + 'time').text)
        
        waypoint = WayPoint(name, lat, lon, elevation, time)
        
        waypoints.append(waypoint) 

    return waypoints