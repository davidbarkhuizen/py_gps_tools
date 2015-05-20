var geoNodeTekControllers = angular.module('GeoNodeTekControllers', []);
var controllers = [
	['GodController', ['$rootScope', '$scope', '$http', '$timeout', GodController]],

	['GpxImportController', ['$scope', '$http', '$timeout', GpxImportController]],
	['GpxExportController', ['$scope', '$http', GpxExportController]],

	['TrackInfosController', ['$rootScope', '$scope', '$http', '$timeout', TrackInfosController]],
	['TracksController', ['$rootScope', '$scope', '$http', '$timeout', TracksController]],
	['ElevationPlotController', ['$scope', '$http', '$timeout', ElevationPlotController]],
	['MapController', ['$rootScope', '$scope', '$http', '$timeout', MapController]],
	['WaypointsController', ['$scope', '$http', '$timeout', WaypointsController]],
];
controllers.forEach(function(ctrl) { geoNodeTekControllers.controller(ctrl[0], ctrl[1]); });

var appName = 'geoNodeTekApp';
var appDependencies = ['GeoNodeTekControllers'];  
var geoNodeTekApp = angular.module(appName, appDependencies);