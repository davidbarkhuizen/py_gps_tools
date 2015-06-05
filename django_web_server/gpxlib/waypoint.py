from point import Point

class Waypoint(Point):

    def __init__(self, name, lat, lon, ele, time, id = None):
        self.id = id
        self.name = name
        super(Waypoint,self).__init__(lat, lon, ele, time)

    def to_dict(self):
    	return {
			'id' : self.id,
			'name' : self.name,

			'lat' : self.lat,
			'lon' : self.lon,
			'ele' :  self.ele,
			
			'time' : self.time.isoformat()
		}
