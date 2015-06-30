function Point(pt) {
	/*
	<trkpt lat="-25.9381111711" lon="27.5921234395">
		<ele>1329.16</ele>
		<time>2014-10-26T11:06:15Z</time>
	</trkpt>
	*/
	this.node = pt;

	this.lat = parseFloat(pt.getAttribute('lat'));
	this.lon = parseFloat(pt.getAttribute('lon'));
	this.ele = parseFloat(getChildNodeText(pt, 'ele'));
	this.time = parseGPX11DateTimeString(getChildNodeText(pt, 'time'));
	this.name = getChildNodeText(pt, 'name')

	// track/segment stat
	//
	this.cumulativeDistanceM = 0;

	this.toStr = function() {

		var str = '{0} ({1}, {2}) @ {3}m [{4}]'.format(
			this.name === undefined ? 'point' : this.name,
			this.lat, 
			this.lon,
			this.ele,
			this.time);
		
		return str;
	};
}

function Segment(trkseg) {
	/*
	<trkseg>
		<trkpt/>
		<trkpt/>
	</trkseg>
	*/
	this.node = trkseg;

	this.points = [];	
	var points = trkseg.getElementsByTagName('trkpt');
	for(var i = 0; i < points.length; i++){
		var point = new Point(points[i]);
		this.points.push(point);
	}

	this.totalDistanceM = 0;
}

function Track(trk) {
	this.node = trk;

	var that = this;

	this.name = getChildNodeText(trk, 'name');
	this.cmt = getChildNodeText(trk, 'cmt');
	this.desc = getChildNodeText(trk, 'desc');
	this.src = getChildNodeText(trk, 'src');
	this.number = getChildNodeText(trk, 'number');
	this.type = getChildNodeText(trk, 'type');

	// trkseg
	//
	this.segments = [];
	var trksegs = trk.getElementsByTagName('trkseg');
	for(var i = 0; i < trksegs.length; i++){
		var segment = new Segment(trksegs[i]);
		this.segments.push(segment);
	}

	var calcTrackStats = function() {

		that.minMaxLat = { 'max' : -180, 'min' : 180 };
		that.minMaxLon = { 'max' : -180, 'min' : 180 };
		that.minMaxEle = { 'max' : -10000, 'min' : 10000 };
		that.minMaxTime = { 'max' : undefined, 'min' : undefined };

		var adjustMinMax = function(minMax, val) {

			var max = minMax.max;
			var min = minMax.min;

			if ((max === undefined) || (val > max)) { 
				max = val; 
			}
			if ((min === undefined) || (val < min)) { 
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

var GpxXml = Object.freeze({

	XMLNS : 'http://www.topografix.com/GPX/1/1',

	RootAttributes : 
		{
			'creator':'gpxmaps.net',
			'version':'1.1',
			
			'xmlns:gpxx' : "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
			'xmlns:wptx1':"http://www.garmin.com/xmlschemas/WaypointExtension/v1",
			'xmlns:gpxtpx':"http://www.garmin.com/xmlschemas/TrackPointExtension/v1",			
			
			'xmlns:xsi':"http://www.w3.org/2001/XMLSchema-instance",
			'xsi:schemaLocation':"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"
		},
	
	XmlHeader : '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'
});

function GPX(xml, fileName) {

	var that = this;

	this.fileName = fileName;

	this.tracks = [];
	this.waypoints = [];

	var parser = new DOMParser();
	
	this.xmlDOM = parser.parseFromString(xml, "text/xml");

	var gpxs = this.xmlDOM.getElementsByTagName('gpx');
	if (gpxs.length != 1)
		throw "expected one and only one gpx element in a file";

	this.node = gpxs[0]; 

	// metadata
	//
	var metadatas = this.xmlDOM.getElementsByTagName('metadata');
	if (metadatas.length > 0) {
		var metadata = metadatas[0];

		var timeStr = getChildNodeText(metadata, 'time');
		this.time = ((timeStr !== undefined) && (timeStr !== ''))
			? new Date(Date.parse(timeStr))
			: undefined;

		this.desc = getChildNodeText(metadata, 'desc'); 
		this.name = getChildNodeText(metadata, 'name'); 
		this.keywords = getChildNodeText(metadata, 'keywords'); 
	}

	// trk
	//
	var trks = this.xmlDOM.getElementsByTagName('trk');
	for(var i = 0; i < trks.length; i++){
		var trk = trks[i];
		var track = new Track(trk);
		this.tracks.push(track);
	}

	// wpt
	//
	var wpts = this.xmlDOM.getElementsByTagName('wpt');
	for(var i = 0; i < wpts.length; i++){
		var wpt = wpts[i];
		var point = new Point(wpt);
		this.waypoints.push(point);
	}

	// SERIALIZE
	// 
	/*
	var serialiser = new XMLSerializer();
	var str = serialiser.serializeToString(xmlDOM);
	console.log(str);
	*/

	this.XmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>';

	this.label = function() {

		var options = [that.name, that.fileName, 'no name'];
		for(i = 0; i < options.length; i++) {
			if (options[i] !== undefined)
				return options[i];
		}
	}
	
	this.track_names = function() {
		return that.tracks.map(function(track) { return track.name; });
	};

	this.track_names_concat = function(token) {
		token = (token == undefined) ? ', ' : token;
		return that.track_names().join(token);
	};

	this.track_count = function() {
		return that.tracks.length;
	};

	this.waypoint_count = function() {
		return that.waypoints.length;
	};
}

// --------------------------------------------------------------------------

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
	nodes = (nodes === undefined) ? [] : nodes;

	var metaDataAttrs = {
		'href' : 'www.gpxmaps.net'
	};

	var linkTextNode = toNode('text', {}, ['gpxmaps.net']);
	var linkNode = toNode('link', {}, [linkTextNode], GpxXml.XMLNS);
	var metaDataNode = toNode('metadata', metaDataAttrs, [linkNode]);
	var gpxChildNodes = [metaDataNode].concat(nodes);
	var gpxNode = toNode('gpx', GpxXml.RootAttributes, gpxChildNodes, GpxXml.XMLNS);

	var xml = (GpxXml.XmlHeader + new XMLSerializer().serializeToString(gpxNode))
		.replace('<gpx ', "<gpx xmlns='http://www.topografix.com/GPX/1/1' "); // lol

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