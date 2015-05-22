function GpxExportController($rootScope, $scope, $http) {

	var model = $scope.$parent.model;
	var tracks = $scope.$parent.tracks;

	$scope.exportCanvas = function(id, fileName) {

		var canvasElement = document.getElementById(id);

		var MIME_TYPE = "image/png";

		var imgURL = canvasElement.toDataURL(MIME_TYPE);

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

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// MAP

	$scope.exportMap = function() {
		var fileName = tracks[0].name.replace(' ', '') + '.png';
		$scope.exportCanvas($scope.$parent.mapCanvasId, fileName);
	};
};