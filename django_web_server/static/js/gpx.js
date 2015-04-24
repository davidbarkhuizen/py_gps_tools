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

	var datum = pointString.split("|")

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

	// name
	//
	this.name = data.name;

	// segments with points
	//
	this.segments = [];
	for(var i in data.segments) {
		var dataSegment = mapData.segments[i];

		var points = [];
		for(var j in dataSegment.points) {
			points.push(parsePoint(seg.points[j]));
		}

		this.segments.push(new Segment('', points));
	}

	for(var i in data.segments) {
		var dataSegment = mapData.segments[i];
}

$scope.processIncomingMapData = function(mapData) {

	// waypoints
	//
	for(var j in mapData.waypoints) {
		
		var pointString = mapData.waypoints[j];
		var datum = pointString.split("|")		

		// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
		// time, lat, lon, ele

		//var timeStr = datum[0];

		var lat = parseFloat(datum[0]);
		var lon = parseFloat(datum[1]);
		var ele = parseFloat(datum[2]);
		var name = datum[3];

		$scope.waypoints.push([lat,lon,ele,name]);
	}

	

	var pointCount = $scope.points.length;
	console.log('point count:  ' + pointCount);

	var getMinMax = function(seriesArray, seriesIndex) {

		var max = undefined;
		var min = undefined;

		for (var i = seriesArray.length - 1; i >= 0; i--) {
			
			var val = seriesArray[i][seriesIndex];

			if ((max == undefined) || (val > max)) { 
				max = val; 
			}
			if ((min == undefined) || (val < min)) { 
				min = val; 
			}
		};

		return { 'max' : max, 'min' : min };
	}		

	var minMaxLat = getMinMax($scope.points, 0);
	var minMaxLon = getMinMax($scope.points, 1);
	var minMaxEle = getMinMax($scope.points, 2);

	var eleDiff = minMaxEle.max - minMaxEle.min;

	var latDiff = minMaxLat.max - minMaxLat.min;
	var lonDiff = minMaxLon.max - minMaxLon.min;
	var latlonAR = lonDiff / latDiff;

	// --------------------------------------

	var logMinMax = function(token, minMax) {
		console.log(token + ' E [' + minMax.min + ', ' + minMax.max + ']');
	};

	logMinMax('Lat', minMaxLat);
	logMinMax('Lon', minMaxLon);
	logMinMax('Ele', minMaxEle);		

	// --------------------------------------

	// viewport

	var viewPortHeight = $scope.windowHeight * 1.0;
	var viewPortWidth = $scope.windowWidth * 1.0;

	var vpHalfHeight = viewPortHeight / 2.0;
	var vpHalfWidth  = viewPortWidth / 2.0;

	var vpAR = viewPortWidth / viewPortHeight;

	var scale = undefined;
	if (latlonAR <= vpAR) {
		// too tall, use y to scale
		scale = viewPortHeight / latDiff;
	}
	else
	{
		// too wide, use x to scale
		scale = viewPortWidth / lonDiff;
	}

	var midLat = 0.5 * (minMaxLat.max + minMaxLat.min);
	var midLon = 0.5 * (minMaxLon.max + minMaxLon.min);
	var midEle = 0.5 * (minMaxEle.max + minMaxEle.min);

	var toRgbString = function(r, g, b) {
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	};