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

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// TRACK - track, segment, point, waypoint

function Point(lat, lon, ele, time) {
	this.lat = lat;
	this.lon = lon;
	this.ele = ele;
	this.time = time;
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

		for (var s in that.segments) {
			for (var p in that.segments[s].points) {
				var point = that.segments[s].points[p];	

				that.minMaxLat = adjustMinMax(that.minMaxLat, point.lat);
				that.minMaxLon = adjustMinMax(that.minMaxLon, point.lon);
				that.minMaxEle = adjustMinMax(that.minMaxEle, point.ele);
				that.minMaxTime = adjustMinMax(that.minMaxTime, point.time);
			}
		}

    	/*
		var logMinMax = function(token, minMax) {
			console.log(token + ' E [' + minMax.min + ', ' + minMax.max + ']');
		};

		logMinMax('Lat', that.minMaxLat);
		logMinMax('Lon', that.minMaxLon);
		logMinMax('Ele', that.minMaxEle);	
		*/

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

		var dayCount = ((that.minMaxTime.max - that.minMaxTime.min) / 1000 / 60 / 60 / 24).toFixed(2);
		that.dayCountString = dayCount + ' days';
	};

	calcTrackStats();

	// waypoints
	//
	this.waypoints = [];
	for(var i in data.waypoints) {
		this.waypoints.push(parseWaypoint(data.waypoints[i]));
	}
}