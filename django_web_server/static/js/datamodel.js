function DataModel() {

	var that = this;

	this.gpxinfos = [];
	that.selectedGpxinfo = null;

	this.gpxs = [];

	this.waypoints = [];
	this.filteredWaypoints = [];

	this.selectedPoint = undefined;

	this.tracks = [];
	this.getTracks = function() {

		that.tracks.length = 0;

		that.gpxs.forEach(function(gpx) {
			that.tracks = that.tracks.concat(gpx.tracks);
		});

		return that.tracks;
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