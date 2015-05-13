var appName = 'geoNodeTekApp';
var appDependencies = ['GeoNodeTekControllers'];  

var geoNodeTekApp = angular.module(appName, appDependencies);

var geoNodeTekControllers = angular.module('GeoNodeTekControllers', []);

var controllers = [
	['GodController', ['$scope', '$http', '$timeout', GodController]],
	['GpxImportController', ['$scope', '$http', '$timeout', GpxImportController]],
	['TrackInfosController', ['$scope', '$http', '$timeout', TrackInfosController]],
	['TracksController', ['$scope', '$http', '$timeout', TracksController]],
	['ElevationPlotController', ['$scope', '$http', '$timeout', ElevationPlotController]],
	['MapController', ['$scope', '$http', '$timeout', MapController]],
	['WaypointsController', ['$scope', '$http', '$timeout', WaypointsController]],
];

for(var c in controllers) {
	var ctrl = controllers[c];
	geoNodeTekControllers.controller(ctrl[0], ctrl[1]);
}