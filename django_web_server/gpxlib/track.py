class Track(object):

    def __init__(self, name, segments):

        self.name = name
        self.segments = segments

        self.maxEle = 0.0
        self.minEle = 0.0
        self.maxLat = 0.0
        self.minLat = 0.0
        self.maxLon = 0.0
        self.minLon = 0.0

        self.calc_min_maxes()

    def __str__(self):
        return 'lat E (%f, %f), lon E (%f, %f), ele E (%f, %f)' % (self.min_lat, self.max_lat, self.min_lon, self.max_lon, self.min_ele, self.max_ele)

    def gen_pt_iterator(self):

        def pt_itr():
            for segment in self.segments:
                for point in segment.points:
                    yield point

        return pt_itr

    def calc_min_maxes(self):
        pt_itr = self.gen_pt_iterator()

        if (len(self.segments) == 0):
            return

        self.max_lat = max([pt.lat for pt in pt_itr()])
        self.min_lat = min([pt.lat for pt in pt_itr()])
        self.max_lon = max([pt.lon for pt in pt_itr()])
        self.min_lon = min([pt.lon for pt in pt_itr()])
        self.max_ele = max([pt.ele for pt in pt_itr()])
        self.min_ele = min([pt.ele for pt in pt_itr()])

    def to_dict(self, id = None):

        track_dict = { 
                'id' : id,

                'name' : self.name, 
                'segments' : []
            }

        for segment in self.segments:
            
            segment_dict = { 
                    'name' : 'no name', 
                    'points' : []
                }

            for point in segment.points:
                segment_dict['points'].append(str(point))    

            track_dict['segments'].append(segment_dict)  

        return track_dict