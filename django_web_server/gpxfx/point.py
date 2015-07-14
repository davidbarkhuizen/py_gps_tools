class Point(object):
	
    def __init__(self, lat, lon, ele, time):
        self.lat = lat
        self.lon = lon
        self.ele = ele
        self.time = time

    def __str__(self):
    	time_str = self.time.isoformat() if self.time is not None else ''
        return '%f|%f|%f|%s' % (self.lat, self.lon, self.ele, time_str)
