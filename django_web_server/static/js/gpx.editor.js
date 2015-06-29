function GPXEditor(gpxs, tracks, waypoints) {

	var that = this;

	this.gpxs = gpxs;
	this.tracks = tracks;
	this.waypoints = waypoints;

	this.aggregateGpxTracks = function() {

		var gpxTracks = [];
		that.gpxs.forEach(function(gpx){
			gpx.tracks.forEach(function(track){
				gpxTracks.push(track);
			});
		});

		return gpxTracks;	
	};			

	this.gpxForWaypoint = function(waypoint) {

		for(i = 0; i < that.gpxs.length; i++) {
			var gpx = that.gpxs[i];

			if (gpx.waypoints.indexOf(waypoint) !== -1)
				return gpx;
		}

		return undefined;
	};

	this.gpxForTrack = function(track) {

		var target = undefined;

		that.gpxs.forEach(function(gpx){
			if (gpx.tracks.indexOf(track) !== -1)
				target = gpx;
		});

		return target;
	};

	this.trackForSegment = function(segment) {

		var allTracks = that.aggregateGpxTracks();
		for(var i = 0; i < allTracks.length; i++) {
			var track = allTracks[i];

			if (track.segments.contains(segment))
				return track;
		}

		return undefined;
	};

	this.segmentForPoint = function(point) {

		var allSegments = []; 
		that.aggregateGpxTracks()
			.forEach(function(track){ 
				allSegments = allSegments.concat(track.segments); 
			});

		for(i = 0; i < allSegments.length; i++) {
			var segment = allSegments[i];

			if (segment.node == point.node.parentNode)
				return segment;
		}

		return undefined;
	};

	this.updateWaypointName = function(waypoint, newName) {

		// xml
		//
		setChildNodeText(waypoint.node, 'name', newName);

		// model
		//
		waypoint.name = newName;

		waypoint.edited = true;
		this.gpxForWaypoint(waypoint).edited = true;
	};

	this.deleteWaypoint = function(waypoint) {

		var gpx = this.gpxForWaypoint(waypoint);

		// xml
		//
		waypoint.node.parentNode.removeChild(waypoint.node);

		// model
		//
		that.waypoints.removeWhere(function(x){ return (x == waypoint); });

		gpx.edited = true;
	};

	this.deleteTrack = function(track) {

		var gpx = this.gpxForTrack(track);

		// xml
		//
		track.node.parentNode.removeChild(track.node);

		// model
		//
		that.tracks.removeWhere(function(x){ return (x == track); });
		gpx.tracks.removeWhere(function(x){ return (x == track); });

		gpx.edited = true;
	};

	this.deleteTrackSegmentSection = function(pathSelectionType, endPoints) {

		// MODEL

		var segment = that.segmentForPoint(endPoints[0]);

		if (segment !== that.segmentForPoint(endPoints[1]))
			throw 'end points do not belong to the same segment';

		// XML

		if (endPoints[0].node.parentNode !== endPoints[1].node.parentNode)
			throw 'end points do not belong to the same trkseg';

		var trkseg = endPoints[0].node.parentNode;

		var before = [], between = [], after = [];

		var trkpts = trkseg.children;
		var stage = PathSelectionType.BEFORE;

		for(var i = 0; i < trkpts.length; i++) {

			var trkpt = trkpts[i];
			var isEndPoint = ((trkpt === endPoints[0].node) || (trkpt === endPoints[1].node));

			if (stage === PathSelectionType.BEFORE) {

				if (isEndPoint === false) {
					before.push(trkpt);
				}
				else {
					stage = PathSelectionType.BETWEEN;
					between.push(trkpt);
				}

				continue;
			}

			if (stage === PathSelectionType.BETWEEN) {

				between.push(trkpt);
				
				if (isEndPoint === true) {
					stage = PathSelectionType.AFTER;
				}
				
				continue;
			}

			after.push(trkpt);
		}

		var trkptsToRemove = undefined;
		switch (pathSelectionType) {

			case PathSelectionType.BEFORE:
				trkptsToRemove = before;
				break;
			case PathSelectionType.BETWEEN:
				trkptsToRemove = between;
				break;
			case PathSelectionType.AFTER:
				trkptsToRemove = after;
				break;
		}

		// MODEL

		var pointsToRemove = [];
		segment.points.forEach(function(point){
			if (trkptsToRemove.contains(point.node)) {
				pointsToRemove.push(point);
			}
		});

		pointsToRemove.forEach(function(point){
			segment.points.remove(point);
		});

		// XML

		trkptsToRemove.forEach(function(trkpt){
			trkseg.removeChild(trkpt);						
		});

		// mark gpx as edited

		var track = that.trackForSegment(segment);
		var gpx = that.gpxForTrack(track);

		gpx.edited = true;

	    if (segment.points.length == 0)
	    	that.deleteTrackSegment(segment);
	};

	this.deleteTrackSegment = function(segment) {

		var track = that.trackForSegment(segment);
		var gpx = that.gpxForTrack(track);

		// XML

		segment.node.parentNode.removeChild(segment.node);

		// MODEL

		track.segments.remove(segment);

		gpx.edited = true;
	};

	this.copyTrackToGpx = function(track, toGpx) {

		var fromGpx = that.gpxForTrack(track);

		// var node = document.importNode(externalNode, deep);

		var trk = toGpx.xmlDOM.importNode(track.node, true);
		toGpx.node.appendChild(trk);

		var track = new Track(trk);
		toGpx.tracks.push(track);
	};

	this.unloadGPX = function(gpx) {

		// model - tracks
		//
		gpx.tracks.forEach(function(track){
			that.tracks.removeWhere(function(x){ return (x == track); });
		});

		// model - waypoints
		//
		gpx.waypoints.forEach(function(waypoint){
			that.waypoints.removeWhere(function(x){ return (x == waypoint); });
		});

		// model - gpxs
		//
		that.gpxs.removeWhere(function(x){ return (x == gpx); });

		// xml
		//
		gpx.node.parentNode.removeChild(gpx.node);
	};
}