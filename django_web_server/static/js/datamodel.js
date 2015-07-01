function DataModel() {

	var that = this;

	this.gpxinfos = [];
	that.selectedGpxinfo = null;

	this.gpxs = [];
	this.selectedGpx = undefined;

	var waypoints = [];
	this.getWaypoints = function(){

		var collated = [];
		
		that.gpxs.forEach(function(gpx) {
			collated = collated.concat(gpx.waypoints);
		});

		waypoints.length = 0;
		collated.forEach(function(waypoint){ waypoints.push(waypoint); });
		return waypoints;
	};
	this.filteredWaypoints = [];

	this.selectedPoint = undefined;

	var tracks = [];
	this.getTracks = function() {

		var collated = [];
		
		that.gpxs.forEach(function(gpx) {
			collated = collated.concat(gpx.tracks);
		});

		tracks.length = 0;
		collated.forEach(function(track){ tracks.push(track); });

		return tracks;
	};

	this.otherGpxsForTrack = function(track) {

		var otherGpxs = [];

		that.gpxs.forEach(function(gpx) {
			if (gpx.tracks.indexOf(track) == -1) {
				otherGpxs.push(gpx);
			}
		});

		return otherGpxs;
	};

	this.gpxForTrack = function(track) {

		var matchingGpx = null;

		that.gpxs.forEach(function(gpx) {
			if (gpx.tracks.indexOf(track) !== -1) {
				matchingGpx = gpx;
			}
		});

		return matchingGpx;
	};
}