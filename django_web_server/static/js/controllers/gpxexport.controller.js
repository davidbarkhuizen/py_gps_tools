function GpxExportController($rootScope, $scope, $http) {

	var model = $scope.$parent.model;
	var tracks = $scope.$parent.tracks;

	$scope.exportCanvas = function(canvas, fileName) {

		var MIME_TYPE = "image/png";

		var imgURL = canvas.toDataURL(MIME_TYPE);

		var dlLink = document.createElement('a');
		dlLink.download = fileName;
		dlLink.href = imgURL;
		dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

		document.body.appendChild(dlLink);
		dlLink.click();
		document.body.removeChild(dlLink);
	};

	$scope.exportXML = function(xml, fileName) {

		var MIME_TYPE = 'text/xml';
		var blob = new Blob([xml], {type: MIME_TYPE});

		var dlBlobURL = window.URL.createObjectURL(blob);

		var dlLink = document.createElement('a');
		dlLink.download = fileName;
		dlLink.href = dlBlobURL;
		dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

		document.body.appendChild(dlLink);
		dlLink.click();
		document.body.removeChild(dlLink);
	};


	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// WAYPOINTS

	$scope.exportWaypointSet = function(waypoints, fileName) {
		fileName = (fileName === undefined) ? 'gpxmaps.net.waypoints.gpx' : fileName;
		
		var xml = waypointsToGpx(waypoints);
		$scope.exportXML(xml, fileName);
	};

	$rootScope.$on(Command.EXPORT_WAYPOINTS, function(evt, data) {
		$scope.exportWaypointSet(data.waypoints, data.fileName);
	});

	$scope.exportAllWaypoints = function() {
		$scope.exportWaypointSet(model.waypoints);
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// MAP

	$scope.exportMap = function() {
		$rootScope.$emit(Command.EXPORT_MAP);
	};

	$rootScope.$on(Command.EXPORT_CANVAS, function(evt, data) {
		$scope.exportCanvas(data.canvas, data.fileName);			
	});		

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// TRACK

	$rootScope.$on(Command.EXPORT_TRACKS, function(evt, data) {

		var matchingTracks = data.ids.map(function(id) {
			return tracks.first(function(track){ return track.id == data.id; });
		});		
			
		$scope.exportTracks(tracks, data.fileName);			
	});		

	$scope.exportTracks = function(tracks, fileName) {

		fileName = (fileName === undefined) ? 'GPXMaps.track.gpx' : fileName;
		
		var xml = tracksToGpx(tracks);
		$scope.exportXML(xml, fileName);
	};

	$scope.exportAllTracks = function() {
		$scope.exportTracks(tracks);
	};
};