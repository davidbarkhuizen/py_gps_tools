import datetime
DATE_TIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'

from x import X
from point import Point
from track import Track
from waypoint import WayPoint
from segment import Segment

def def_log_fn(s):
    pass

def parse_gpx_xml_to_track(xml_string, log = def_log_fn):

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