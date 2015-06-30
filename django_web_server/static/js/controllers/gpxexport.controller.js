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

	$scope.exportXML = function(xml, fileName, mimeType) {

		mimeType = (mimeType === undefined) ? 'text/xml' : mimeType;

		var blob = new Blob([xml], {type: mimeType});

		var dlBlobURL = window.URL.createObjectURL(blob);

		var dlLink = document.createElement('a');
		dlLink.download = fileName;
		dlLink.href = dlBlobURL;
		dlLink.dataset.downloadurl = [mimeType, dlLink.download, dlLink.href].join(':');

		document.body.appendChild(dlLink);
		dlLink.click();
		document.body.removeChild(dlLink);
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// WAYPOINTS

	$scope.exportWaypointSetAsGpx = function(waypoints, fileName) {
		fileName = (fileName === undefined) ? 'gpxmaps.net.waypoints.gpx' : fileName;
		
		var xml = waypointsToGpx(waypoints);
		$scope.exportXML(xml, fileName);
	};

	$scope.exportWaypointSetAsTxt = function(waypoints, fileName) {
		fileName = (fileName === undefined) ? 'gpxmaps.net.waypoints.txt' : fileName;
		
		var lines = [];
		waypoints.forEach(function(wpt){ lines.push(wpt.toStr()); });
		var txt = lines.join('\r\n');

		$scope.exportXML(txt, fileName, 'text/xml');
	};

	$rootScope.$on(Command.EXPORT_WAYPOINTS, function(evt, data) {

		if (data.format == 'TXT') {
			$scope.exportWaypointSetAsTxt(data.waypoints, data.fileName);
		}
		else {
			$scope.exportWaypointSetAsGpx(data.waypoints, data.fileName);
		}
	});

	$scope.exportAllWaypoints = function() {
		$scope.exportWaypointSetAsGpx(model.waypoints);
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