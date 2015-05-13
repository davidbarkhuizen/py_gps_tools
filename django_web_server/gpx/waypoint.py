from point import Point

class WayPoint(Point):

    def __init__(self, id, name, lat, lon, ele, time):
        self.id = id
        self.name = name
        super(WayPoint,self).__init__(lat, lon, ele, time)

    def __str__(self):
        return '%f|%f|%f|%s|%s|%i' % (self.lat, self.lon, self.ele, self.name, self.time.isoformat(), self.id)  