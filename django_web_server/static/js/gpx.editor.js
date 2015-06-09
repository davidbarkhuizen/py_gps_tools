function GPXEditor(gpxs, tracks, waypoints) {

	var that = this;

	this.gpxs = gpxs;
	this.tracks = tracks;
	this.waypoints = waypoints;

	this.gpxForWaypoint = function(waypoint) {

		for(i = 0; i < gpxs.length; i++) {

			var gpx = gpxs[i];

			if (gpx.waypoints.indexOf(waypoint) !== -1)
				return gpx;
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
}