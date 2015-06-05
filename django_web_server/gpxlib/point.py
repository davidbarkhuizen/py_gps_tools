class Point(object):
	
    def __init__(self, lat, lon, ele, time):
        self.lat = lat
        self.lon = lon
        self.ele = ele
        self.time = time

    def __str__(self):
        return '%f|%f|%f|%s' % (self.lat, self.lon, self.ele, self.time.isoformat())
