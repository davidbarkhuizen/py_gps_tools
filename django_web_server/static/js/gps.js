/*
WAY POINTS

navigational/logistical
- start/end
- junction
- toilets
- camp
- water point
- landmark (cairn, very large stone, giant tree, distinct ruin, mineshaft, building) 

archeological
- indestinct ruins

*/

// http://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
// http://www.movable-type.co.uk/scripts/latlong.html
//
// 4 significant digits ?
//
function haversineDistanceMetres(lat1, lon1, lat2, lon2) {

	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;

	return d * 1000.0;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// TRACK - track, segment, point, waypoint

function Point(lat, lon, ele, time) {
	this.lat = lat;
	this.lon = lon;
	this.ele = ele;
	this.time = time;
	this.cumulativeDistanceM = 0;
}

function WayPoint(name, lat, lon, ele, time) {
	this.name = name;
	// no inheritance :(
	this.lat = lat;
	this.lon = lon;
	this.ele = ele;
	this.time = time;
}

function Segment(name, points) {
	this.name = name;
	this.points = points;
	this.totalDistanceM = 0;
}

Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
}
function toShortTimeString(dt) {
	return dt.getHours().pad() + ':' + dt.getMinutes().pad();
};

var parsePoint = function(pointString) {

	// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
	// time, lat, lon, ele

	var datum = pointString.split("|")

	//var timeStr = datum[0];

	var lat = parseFloat(datum[0]);
	var lon = parseFloat(datum[1]);
	var ele = parseFloat(datum[2]);
	var t = new Date(Date.parse(datum[3]));

	return new Point(lat, lon, ele, t);
};

var parseWaypoint = function(waypointString) {

	// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
	// time, lat, lon, ele

	var datum = waypointString.split("|")

	var lat = parseFloat(datum[0]);
	var lon = parseFloat(datum[1]);
	var ele = parseFloat(datum[2]);
	var name = datum[3];
	var time = Date.parse(datum[4]);

	return new WayPoint(name, lat, lon, ele, time);
};

function Track(data) {

	var that = this;

	// name
	//
	this.name = data.name;
	this.id = data.trackId;

	// segments with points
	//
	this.segments = [];
	for(var i in data.segments) {
		var dataSegment = data.segments[i];

		var points = [];
		for(var j in dataSegment.points) {
			points.push(parsePoint(dataSegment.points[j]));
		}

		this.segments.push(new Segment('', points));
	}

	/*
	console.log('name:  ' + this.name);
	console.log('segment count:' + this.segments.length.toString());
	for (var i in this.segments) {
		console.log('segment ' + (i + 1).toString() + ', point count:' + this.segments[i].points.length.toString());
	}
	*/

	var calcTrackStats = function() {

		var minMaxUndef = { 'max' : -10000, 'min' : 10000 };

		that.minMaxLat = minMaxUndef;
		that.minMaxLon = minMaxUndef;
		that.minMaxEle = minMaxUndef;
		that.minMaxTime = { 'max' : undefined, 'min' : undefined };

		var adjustMinMax = function(minMax, val) {

			var max = minMax.max;
			var min = minMax.min;

			if ((max == undefined) || (val > max)) { 
				max = val; 
			}
			if ((min == undefined) || (val < min)) { 
				min = val; 
			}

			return { 'max' : max, 'min' : min };
		};

		var cumTrackDistM = 0;

		for (var s in that.segments) {
			
			var cumSegmentDistM = 0;

			for (var p in that.segments[s].points) {
				var point = that.segments[s].points[p];	

				that.minMaxLat = adjustMinMax(that.minMaxLat, point.lat);
				that.minMaxLon = adjustMinMax(that.minMaxLon, point.lon);
				that.minMaxEle = adjustMinMax(that.minMaxEle, point.ele);
				that.minMaxTime = adjustMinMax(that.minMaxTime, point.time);
			
				if (p > 0) {

					var lastPoint = that.segments[s].points[p - 1]; 

					var distM = haversineDistanceMetres(lastPoint.lat, lastPoint.lon, point.lat, point.lon);
					cumSegmentDistM = cumSegmentDistM + distM;

					point.cumulativeDistanceM = cumSegmentDistM;
				}
			}

			cumTrackDistM = cumTrackDistM + cumSegmentDistM;
		}

		that.totalDistanceM = cumTrackDistM;

     	// calcs from range

		that.eleDiff = that.minMaxEle.max - that.minMaxEle.min;
		that.latDiff = that.minMaxLat.max - that.minMaxLat.min;
		that.lonDiff = that.minMaxLon.max - that.minMaxLon.min;

		// AR = x / y
		//
		that.latlonAR = that.lonDiff / that.latDiff;

		that.midLat = 0.5 * (that.minMaxLat.max + that.minMaxLat.min);
		that.midLon = 0.5 * (that.minMaxLon.max + that.minMaxLon.min);
		that.midEle = 0.5 * (that.minMaxEle.max + that.minMaxEle.min);

		that.periodString = '';
		if (that.minMaxTime.max.toDateString() == that.minMaxTime.min.toDateString()) {
			// same day
			that.periodString = that.minMaxTime.max.toDateString();
			that.periodString = that.periodString + ':  ' + toShortTimeString(that.minMaxTime.min) + ' - ' + toShortTimeString(that.minMaxTime.max);

		} else {
			// different days
			var from = that.minMaxTime.min.toDateString()  + ' ' + toShortTimeString(that.minMaxTime.min);
			var to = that.minMaxTime.max.toDateString()  + ' ' + toShortTimeString(that.minMaxTime.max);
			that.periodString = from + ' - ' + to;
		}

		var offSet = that.minMaxTime.min.getTimezoneOffset();
		that.periodString = that.periodString + ' (UTC ' + (offSet <= 0 ? "+" : "-") + (Math.abs(offSet)).toString() + ' mins)';

		var durationMS = that.minMaxTime.max - that.minMaxTime.min;

		var daysToMS = 1000.0 * 60.0 * 60.0 * 24.0;
		var days = Math.floor(durationMS / daysToMS);

		var hoursMS = durationMS - (days * daysToMS); 
		var hoursToMS = 1000.0 * 60.0 * 60.0; 
		var hours = Math.floor(hoursMS / hoursToMS);

		var minsMS = hoursMS - (hours * hoursToMS);
		var minsToMS = 1000.0 * 60.0; 
		var mins = Math.floor(minsMS / minsToMS);

		var secsMS = minsMS - (mins * minsToMS);
		var secsToMS = 1000.0; 
		var secs = Math.floor(secsMS / secsToMS);

		that.durationString = days + ' days ' + hours + ' hours ' + mins + ' minutes ' + secs + ' seconds';
	};

	calcTrackStats();

	// waypoints
	//
	this.waypoints = [];
	for(var i in data.waypoints) {
		this.waypoints.push(parseWaypoint(data.waypoints[i]));
	}
}