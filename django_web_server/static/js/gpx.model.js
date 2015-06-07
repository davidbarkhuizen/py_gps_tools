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

function Point(lat, lon, ele, time) {
	this.lat = lat;
	this.lon = lon;
	this.ele = ele;
	this.time = time;
	this.cumulativeDistanceM = 0;
}

function Waypoint(id, name, lat, lon, ele, time) {
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
}

function parsePoint(pointString) {

	// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
	// time, lat, lon, ele

	var datum = pointString.split("|")

	//var timeStr = datum[0];

	var lat = parseFloat(datum[0]);
	var lon = parseFloat(datum[1]);
	var ele = parseFloat(datum[2]);
	var t = new Date(Date.parse(datum[3]));

	return new Point(lat, lon, ele, t);
}

function parseWaypointDict(wp) {

	var id = wp.id;
	var name = wp.name;

	var lat = parseFloat(wp.lat);
	var lon = parseFloat(wp.lon);
	var ele = parseFloat(wp.ele);
	
	var time = Date.parse(wp.time);

	return new Waypoint(id, name, lat, lon, ele, time);
}

function Track(data) {

	var that = this;

	// name
	//
	this.name = data.name;

	// segments
	//
	this.segments = [];
	data.segments.forEach(function(segment){ 
		var points = [];
		segment.points.forEach(function(point) {
			points.push(parsePoint(point));
		});
		that.segments.push(new Segment('', points));
	});

	var calcTrackStats = function() {

		that.minMaxLat = { 'max' : -180, 'min' : 180 };
		that.minMaxLon = { 'max' : -180, 'min' : 180 };
		that.minMaxEle = { 'max' : -10000, 'min' : 10000 };
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

function GPX(name, desc, tracks, waypoints, file_name) {

	this.name = name;
	this.desc = desc;

	this.tracks = tracks;
	this.waypoints = waypoints;

	this.file_name = file_name;

	this.track_names = function() {
		return this.tracks.map(function(track) { return track.name; });
	};

	this.track_count = function() {
		return this.tracks.length;
	};

	this.waypoint_count = function() {
		return this.waypoints.length;
	};
}

// --------------------------------------------------------------------------
// TO XML

var xmlDoc = document
	.implementation
	.createDocument(null, null, null);

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

function nodestoGpx(nodes) {
	nodes = (nodes == undefined) ? [] : nodes;

	var metaDataAttrs = {
		'href' : 'www.gpxmaps.net'
	};

	var linkTextNode = toNode('text', {}, ['gpxmaps.net']);
	var linkNode = toNode('link', {}, [linkTextNode], GPX.XMLNS);
	var metaDataNode = toNode('metadata', metaDataAttrs, [linkNode]);
	var gpxChildNodes = [metaDataNode].concat(nodes);
	var gpxNode = toNode('gpx', GPX.RootAttributes, gpxChildNodes, GPX.XMLNS);

	var xml = (GPX.XmlHeader + new XMLSerializer().serializeToString(gpxNode))
		.replace('<gpx ', "<gpx xmlns='http://www.topografix.com/GPX/1/1' "); // WTF

	return xml;
}

function pointToNode(tag, point) {

	var attributes = {};
	var childNodes = [];

	// ATTRIBUTES

	// lat, lon

	if (point.lat !== undefined) {
		attributes.lat = point.lat.toFixed(6); 		
	}

	if (point.lon !== undefined) {
		attributes.lon = point.lon.toFixed(6); 		
	}

	// CHILD ELEMENTS

	// ele

	if (point.ele !== undefined) {
		var eleNode = toNode('ele', [], [point.ele.toFixed(6)]);
		childNodes.push(eleNode);
	}

	// time	

	if (point.time !== undefined) {
		var timeNode = toNode('time', [], [toZTimeStr(new Date(point.time))]);
		childNodes.push(timeNode);
	}	

	// name	

	if (point.name !== undefined) {
		var nameNode = toNode('name', [], [point.name]);
		childNodes.push(nameNode);
	}

	// TODO sym

	return toNode(tag, attributes, childNodes);
}

function waypointsToGpx(waypoints) {

	var nodes = [];
	waypoints.forEach(function(wp){

		var wptNode = pointToNode('wpt', wp);
		nodes.push(wptNode);
	});

	return nodestoGpx(nodes);
}

function tracksToGpx(tracks) {

	/*
	<trk>
		<name>ROSEBANK TO SLEEPY RIVER HEKPOORT</name>
		<extensions/>
		<trkseg>
			<trkpt lat="-25.9381111711" lon="27.5921234395">
				<ele>1329.16</ele>
				<time>2014-10-26T11:06:15Z</time>
			</trkpt>
			<trkpt lat="-25.9381003585" lon="27.5921297260">
				<ele>1331.56</ele>
				<time>2014-10-26T11:06:25Z</time>
			</trkpt>
		</trkseg>
	</trk>
	*/

	var trackNodes = [];	

	tracks.forEach(function(track){

		var trkChildNodes = [];

		if (track.name !== undefined) {
			var trkNameNode = toNode('name', [], [track.name]);
			trkChildNodes.push(trkNameNode);
		}

		/*
		// TODO TRACK EXTENSIONS
		var trkExtensionsNode = toNode('extensions', [], []);
		trkChildNodes.push(trkExtensionsNode);
		*/

		track.segments.forEach(function(segment){

			var trkptNodes = segment.points.map(function(point){
				return pointToNode('trkpt', point);
			});

			var trksegNode = toNode('trkseg', {}, trkptNodes);
			trkChildNodes.push(trksegNode);
		});

		var trackNode = toNode('trk', [], trkChildNodes);
		trackNodes.push(trackNode);
	});

	return nodestoGpx(trackNodes);
}