function GpxExportController($scope, $http) {

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

	$scope.$on(Command.EXPORT_WAYPOINTS, function(evt, waypoints) {
		var xml = waypointsToGpx(waypoints);
		$scope.exportXML(xml, 'waypoints.gpx');
	});
};