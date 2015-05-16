function GpxExportController($scope, $http) {

	$scope.canExport = false;

	var dlBlobURL = null;
	$scope.makeAvailableForDownLoad = function(xml, fileName) {

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

		$scope.canExport = true;
	};

	$scope.$on(Command.MAKE_GPX_FILE_AVAILABLE_FOR_EXPORT, function(evt, data) {

		$scope.makeAvailableForDownLoad(data.xml, data.fileName);
	});
};