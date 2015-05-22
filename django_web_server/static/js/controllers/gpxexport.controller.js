function GpxExportController($rootScope, $scope, $http) {

	var model = $scope.$parent.model;

	var dlBlobURL = null;
	$scope.exportXML = function(xml, fileName) {

		var MIME_TYPE = 'text/xml';
		var blob = new Blob([xml], {type: MIME_TYPE});

		if (dlBlobURL != null) {
			// release previous
		};
		dlBlobURL = window.URL.createObjectURL(blob);

		var dlLink = document.getElementById('GpxDownloadLink');
		dlLink.download = fileName;
		dlLink.href = dlBlobURL;
		dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

		dlLink.click();
	};


	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// WAYPOINTS

	$scope.exportWaypointSet = function(waypoints, fileName) {
		fileName = (fileName == undefined) ? 'geonodetek.waypoints.gpx' : fileName;
		
		var xml = waypointsToGpx(waypoints);
		$scope.exportXML(xml, fileName);
	};

	$rootScope.$on(Command.EXPORT_WAYPOINTS, function(evt, data) {
		$scope.exportWaypointSet(data.waypoints, data.fileName);
	});

	$scope.exportAllWaypoints = function() {
		$scope.exportWaypointSet(model.waypoints, 'geonodetek.waypoints.');
	};
};