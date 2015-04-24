/*
	function Foo(bar) {
	this._bar = bar;
	}

	Foo.prototype.getBar = function() {
	return this._bar;
	};

	var foo = new Foo('bar');
	alert(foo.getBar()); // 'bar'
	alert(foo._bar); /
*/
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// TRACK - track, segment, point, waypoint

function Point(lat, lon, ele) {
	this.lat = lat;
	this.lon = lon;
	this.ele = ele;
}

function WayPoint(name, lat, lon, ele) {
	this.name = name;
	// no inheritance :(
	this.lat = lat;
	this.lon = lon;
	this.ele = ele;
}

function Segment(name, points) {
	this.name = name;
	this.points = points;
}

var parsePoint = function(pointString) {

	// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
	// time, lat, lon, ele

	var datum = pointString.split("|")

	//var timeStr = datum[0];

	var lat = parseFloat(datum[0]);
	var lon = parseFloat(datum[1]);
	var ele = parseFloat(datum[2]);

	return new Point(lat, lon, ele);
};

var parseWaypoint = function(waypointString) {

	// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
	// time, lat, lon, ele

	var datum = waypointString.split("|")

	//var timeStr = datum[0];

	// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
	// time, lat, lon, ele

	//var timeStr = datum[0];

	var lat = parseFloat(datum[0]);
	var lon = parseFloat(datum[1]);
	var ele = parseFloat(datum[2]);
	var name = datum[3];

	return new WayPoint(name, lat, lon, ele);
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

	console.log('name:  ' + this.name);
	console.log('segment count:' + this.segments.length.toString());
	for (var i in this.segments) {
		console.log('segment ' + (i + 1).toString() + ', point count:' + this.segments[i].points.length.toString());
	}

	var calcTrackStats = function() {

		var minMaxUndef = { 'max' : -10000, 'min' : 10000 };

		that.minMaxLat = minMaxUndef;
		that.minMaxLon = minMaxUndef;
		that.minMaxEle = minMaxUndef;

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
			}
		}

		var logMinMax = function(token, minMax) {
			console.log(token + ' E [' + minMax.min + ', ' + minMax.max + ']');
		};

		logMinMax('Lat', that.minMaxLat);
		logMinMax('Lon', that.minMaxLon);
		logMinMax('Ele', that.minMaxEle);	

		// calcs from range

		that.eleDiff = that.minMaxEle.max - that.minMaxEle.min;
		that.latDiff = that.minMaxLat.max - that.minMaxLat.min;
		that.lonDiff = that.minMaxLon.max - that.minMaxLon.min;

		// AR = x / y
		//
		that.latlonAR = that.lonDifflonDiff / that.lonDifflatDiff;

		that.midLat = 0.5 * (that.minMaxLat.max + that.minMaxLat.min);
		that.midLon = 0.5 * (that.minMaxLon.max + that.minMaxLon.min);
		that.midEle = 0.5 * (that.minMaxEle.max + that.minMaxEle.min);
	};

	calcTrackStats();

	// waypoints
	//
	this.waypoints = [];
	for(var i in data.waypoints) {
		this.waypoints.push(parseWaypoint(data.waypoints[i]));
	}
}