class TrackPoint(object):
    def __init__(self, lat, lon, ele, time):
        self.lat = lat
        self.lon = lon
        self.ele = ele
        self.time = time

class TrackSegment(object):
    def __init__(self, trackpoints = []):
        self.trackpoints = trackpoints
        
class Track(object):
    def __init__(self, name = '', tracksegments = []):
        self.name = name
        self.tracksegments = tracksegments











