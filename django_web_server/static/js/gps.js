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

function WayPoint(id, name, lat, lon, ele, time) {
	this.id = id;
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

var parseWaypointDict = function(wp) {

	var id = wp.id;
	var name = wp.name;

	var lat = parseFloat(wp.lat);
	var lon = parseFloat(wp.lon);
	var ele = parseFloat(wp.ele);
	
	var time = Date.parse(wp.time);

	return new WayPoint(id, name, lat, lon, ele, time);
};

function Track(data) {

	var that = this;

	// name
	//
	this.name = data.name;
	this.id = data.id;
	// time ?

	this.segments = [];
	data.segments.forEach(function(segment){ 
		var points = [];
		segment.points.forEach(function(point) {
			points.push(parsePoint(point));
		});
		that.segments.push(new Segment('', points));
	});

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
}

// ----------------------------------------------------------------------------
// XML

var xmlDoc = document.implementation.createDocument(null, null, null);

function toNode(tagName, attributes, children) {

    var node = xmlDoc.createElement(tagName);

    for(var attr in attributes) {
    	node.setAttribute(attr, attributes[attr]);
    };	    

    var text, child;

    for(var i = 0; i < children.length; i++) {
        child = children[i];
        if(typeof child == 'string') {
            child = xmlDoc.createTextNode(child);
        }
        node.appendChild(child);
    }

    return node;
}

function toGpxXml(childNodes) {

	var gpxAttrs =  {
		'xmlns' : "http://www.topografix.com/GPX/1/1",
		'xmlns:gpxx' : "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
		'xmlns:wptx1':"http://www.garmin.com/xmlschemas/WaypointExtension/v1",
		'xmlns:gpxtpx':"http://www.garmin.com/xmlschemas/TrackPointExtension/v1",
		'creator':"GeoNodeTek",
		'version':"1.1",
		'xmlns:xsi':"http://www.w3.org/2001/XMLSchema-instance",
		'xsi:schemaLocation':"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"
	};

	var metaDataAttrs = {
		'href' : 'www.geonodetek.com'
	};

	var linkText = toNode('text', {}, ['GeoNodeTek']);
	var link = toNode('link', {}, [linkText]);
	var metadata = toNode('metadata', metaDataAttrs, [link]);

	var gpxChildren = (childNodes == undefined) ? [] : childNodes;
	gpxChildren.push(metadata);

	var gpx = toNode('gpx', gpxAttrs, gpxChildren);

	var xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>';

	var xml = xmlHeader + new XMLSerializer().serializeToString(gpx);

	return xml;
}

function waypointsToGpx(waypoints) {

	var nodes = [];
	waypoints.forEach(function(wp){

		var lat = wp.lat.toFixed(6);
		var lon = wp.lon.toFixed(6);

		var ele = toNode('ele', [], [wp.ele.toFixed(6)]);

		function lpad0(s) {
			return (s.length == 2) ? s : '0' + s;
		}

		function toZTimeStr(dt) {
			// 2012-09-16T10:02:30Z

			var dateS = dt.getUTCFullYear().toString() 
				+ '-'
				+ lpad0((dt.getUTCMonth() + 1).toString())
				+ '-'
				+ lpad0(dt.getUTCDate().toString());
			
			var timeS = lpad0(dt.getUTCHours().toString())
				+ ':'
				+ lpad0(dt.getMinutes().toString())
				+ ':'
				+ lpad0(dt.getSeconds().toString());

			return dateS + 'T' + timeS + 'Z';
		}

		var time = toNode('time', [], [toZTimeStr(new Date(wp.time))]);

		var name = toNode('name', [], [wp.name]);
		
		// sym

		nodes.push(toNode('wpt', { 'lat' : lat, 'lon' : lon }, [ele, time, name]));
	});

	return toGpxXml(nodes);
};

// -------------------------------------------------------------------

