function GPXEditor(gpxs, tracks, waypoints) {

	var that = this;

	this.gpxs = gpxs;
	this.tracks = tracks;
	this.waypoints = waypoints;

	this.gpxForWaypoint = function(waypoint) {

		for(i = 0; i < this.gpxs.length; i++) {

			var gpx = this.gpxs[i];

			if (gpx.waypoints.indexOf(waypoint) !== -1)
				return gpx;
		}

		return undefined;
	};

	this.gpxForTrack = function(track) {

		var target = undefined;

		this.gpxs.forEach(function(gpx){
			if (gpx.tracks.indexOf(track) !== -1)
				target = gpx;
		});

		return target;
	};

	this.segmentForPoint = function(point) {

		var allSegments = []; 
		that.tracks.forEach(function(track){ allSegments.concat(track.segments); });

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

		// XML

		if (endPoints[0].parentNode !== endPoints[1].parentNode)
			throw 'end points do not belong to the same track segment';

		var trkseg = endPoints[0].parentNode;

		var before = [], between = [], after = [];

		var trkpts = trkseg.children;
		var stage = PathSelectionType.BEFORE:
		for(i = 0; i < trkpts.length; i++) {

			var trkpt = trkpts[i];
			var isEndPoint = ((trkpt === endPoints[0].node) || (trkpts[i] === endPoints[1].node));

			if (stage == PathSelectionType.BEFORE) {
				
				if (!isEndPoint)
					before.push(trkpt);
				else {
					stage = PathSelectionType.BETWEEN;
					between.push(trkpt);
				}

				continue;
			}

			if (stage == PathSelectionType.BETWEEN) {

				between.push(trkpt);
				
				if (isEndPoint)
					stage = PathSelectionType.AFTER;
				
				continue;
			}

			after.push(trkpt);
		}

		var toRemove = undefined;
		switch (pathSelectionType) {
			case PathSelectionType.BEFORE:
				toRemove = before;
				break;
			case PathSelectionType.BETWEEN:
				toRemove = between;
				break;
			case PathSelectionType.AFTER:
				toRemove = after;
				break;
		}

		toRemove.forEach(function(trkpt){
			trkseg.removeChild(trkpt);						
		});
	}
}