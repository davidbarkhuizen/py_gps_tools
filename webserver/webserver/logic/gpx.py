class Point(object):
    def __init__(self, lat, lon, ele, time):
        self.lat = lat
        self.lon = lon
        self.ele = ele
        self.time = time

class Segment(object):
    def __init__(self, points = []):
        self.points = points
        
class Track(object):
    def __init__(self, name = '', segments = []):
        self.name = name
        self.segments = segments

import xml.etree.ElementTree as ET
import datetime

DATE_TIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'

def track_to_dict(track):

    trk = {}
    trk = { 'name' : track.name, 'segments' : [] }

    for segment in track.segments:
        seg = { 'name' : 'segment', 'points' : []}
        for point in segment.points:
            p = '%s|%f|%f|%f' % (point.time, point.lat, point.lon, point.ele)
            seg['points'].append(p)       
        trk['segments'].append(seg)

    return trk

def parse_string_to_track(xml_string):

    root = ET.fromstring(xml_string)
    
    root_tag_text = str(root)
    ns = root_tag_text[root_tag_text.find('{') : root_tag_text.find('}') + 1]
    
    token = '/'
    
    def find(path):
        paths = path.split(token)        
        
        xpath = ''        
        for p in paths:
            xpath = xpath + token + ns + p        
        xpath = xpath[len(token):]
        
        return root.find(xpath)
    
    def findall(path):
        paths = path.split(token)        
        
        xpath = ''        
        for p in paths:
            xpath = xpath + token + ns + p        
        xpath = xpath[len(token):]
        
        return root.findall(xpath)
    
    # metadata time
    
    metadata_time_stamp_string = find('metadata/time').text
    meta_data_time = datetime.datetime.strptime(metadata_time_stamp_string, DATE_TIME_FORMAT)    
  
    print('metadata - time @ %s' % meta_data_time)
  
    # track
    
    gpx_track = Track()
    
    ## track name
    
    gpx_track.name = find('trk/name').text
    print('track name - %s' % gpx_track.name)
    
    ## track segments
    
    track_segments = findall('trk/trkseg')
    print('track segment count = %i ' % len(track_segments))
    
    for track_segment in track_segments:
        
        gpx_tracksegment = Segment()
        
        for track_point in track_segment:
          
            lat = float(track_point.get('lat'))
            lon = float(track_point.get('lon'))
            elevation = float(track_point.find(ns + 'ele').text)
            time = datetime.datetime.strptime((track_point.find(ns + 'time').text), DATE_TIME_FORMAT)
            
            gpx_trackpoint = Point(lat, lon, elevation, time)
            
            gpx_tracksegment.points.append(gpx_trackpoint) 

        print('trackpoint count = %i' % len(gpx_tracksegment.points))

        gpx_tracksegment.points = sorted(gpx_tracksegment.points, key=lambda x : x.time)
        print('started @ %s' % gpx_tracksegment.points[0].time)
        print('ended @ %s' % gpx_tracksegment.points[len(gpx_tracksegment.points) - 1].time)  

        gpx_track.segments.append(gpx_tracksegment)

    return gpx_track