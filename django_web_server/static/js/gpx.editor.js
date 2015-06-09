function GPXEditor(gpxs) {

	this.gpxs = gpxs;

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
}