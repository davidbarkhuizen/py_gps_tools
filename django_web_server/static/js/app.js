var appName = 'geoNodeTekApp';
var appDependencies = ['GeoNodeTekControllers'];  

var geoNodeTekApp = angular.module(appName, appDependencies);

var geoNodeTekControllers = angular.module('GeoNodeTekControllers', []);

var controllers = [
	['GodController', ['$scope', '$http', '$timeout', GodController]],
	['TrackListController', ['$scope', '$http', '$timeout', TrackListController]],
	['ElevationPlotController', ['$scope', '$http', '$timeout', ElevationPlotController]],
	['GpxImportController', ['$scope', '$http', '$timeout', GpxImportController]],
	['MapController', ['$scope', '$http', '$timeout', MapController]],
];

for(var c in controllers) {
	var ctrl = controllers[c];
	geoNodeTekControllers.controller(ctrl[0], ctrl[1]);
}

