function GpxExportController($scope, $http) {

	$scope.canExport = false;

	$scope.export = function() {

		var xml = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?><gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" creator="eTrex 20" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"><metadata><link href="http://www.garmin.com"><text>Garmin International</text></link><time>2015-05-15T06:53:24Z</time></metadata><wpt lat="-26.794428" lon="28.228980"><ele>1591.194824</ele><time>2015-05-15T06:53:24Z</time><name>HABITAT</name><sym>Flag, Blue</sym></wpt>';

		var MIME_TYPE = 'text/xml';
		var blob = new Blob([xml], {type: MIME_TYPE});
		var blobURL = window.URL.createObjectURL(blob);

		var a = document.getElementById('GpxDownloadLink');
		a.download = 'GeoNodeTek.gpx';
		a.href = blobURL;

		a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');

		$scope.canExport = true;
	};
};