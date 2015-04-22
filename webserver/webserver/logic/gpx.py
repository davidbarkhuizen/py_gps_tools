class Point(object):
    def __init__(self, lat, lon, ele, time):
        self.lat = lat
        self.lon = lon
        self.ele = ele
        self.time = time

class Segment(object):
    def __init__(self, points):
        self.points = points
        
class Track(object):
    def __init__(self, name, segments):
        self.name = name
        self.segments = segments

class WayPoint(Point):
    def __init__(self, name, lat, lon, ele, time):
        self.name = name
        super(WayPoint,self).__init__(lat, lon, ele, time)

import datetime
DATE_TIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'

def def_log_fn(s):
    print(s)

import xml.etree.ElementTree as ET

def track_to_dict(track, take = 1):

    trk = {}
    trk = { 'name' : track.name, 'segments' : [] }

    for segment in track.segments:
        
        seg = { 'name' : 'segment', 'points' : []}

        i = take - 1

        for point in segment.points:
            # p = '%s|%f|%f|%f' % (point.time, point.lat, point.lon, point.ele)
            p = '%f|%f|%f' % (point.lat, point.lon, point.ele)

            i = i + 1
            if i % take == 0:
                seg['points'].append(p)    

        trk['segments'].append(seg)

    return trk

class X(object):

    def __init__(self, xml_string):

        self.xml_string = xml_string

        self.root = ET.fromstring(xml_string)

        self.root_tag_text = str(self.root)
        self.ns = self.root_tag_text[self.root_tag_text.find('{') : self.root_tag_text.find('}') + 1]

        self.token = '/'

    def to_xpath(self, path):
        xpath = ''        
        for p in path.split(self.token):
            xpath = xpath + self.token + self.ns + p        
        xpath = xpath[len(self.token):]
        return xpath

    def find(self, path):
        return self.root.find(self.to_xpath(path))

    def findall(self, path):
        return self.root.findall(self.to_xpath(path))

def parse_string_to_track(xml_string, log = def_log_fn):

    x = X(xml_string)
    ns = x.ns
    def find(path): return x.find(path)
    def findall(path): return x.findall(path)

    # metadata time

    metadata_time_stamp_string = find('metadata/time').text
    meta_data_time = datetime.datetime.strptime(metadata_time_stamp_string, DATE_TIME_FORMAT)    

    log('metadata - time @ %s' % meta_data_time)
  
    # track
    
    gpx_track = Track('', [])
    
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

def parse_string_to_waypoints(xml_string, log = def_log_fn):

    x = X(xml_string)
    ns = x.ns
    def find(path):
        return x.find(path)
    def findall(path):
        return x.findall(path)

    # metadata time
    metadata_time_stamp_string = find('metadata/time').text
    meta_data_time = datetime.datetime.strptime(metadata_time_stamp_string, DATE_TIME_FORMAT)    

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
        time = datetime.datetime.strptime((xml_waypoint.find(ns + 'time').text), DATE_TIME_FORMAT)
        
        waypoint = WayPoint(name, lat, lon, elevation, time)
        
        waypoints.append(waypoint) 

    return waypoints