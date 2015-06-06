var GPXMapsControllers = angular.module('GPXMapsControllers', []);
var controllers = [
	['GodController', ['$rootScope', '$scope', '$http', '$timeout', GodController]],

	['GpxImportController', ['$rootScope', '$scope', '$http', '$timeout', GpxImportController]],
	['GpxExportController', ['$rootScope', '$scope', '$http', GpxExportController]],

	['GpxDatabaseController', ['$rootScope', '$scope', '$http', '$timeout', GpxDatabaseController]],
	['GpxController', ['$rootScope', '$scope', '$http', '$timeout', GpxController]],

	['TracksController', ['$rootScope', '$scope', '$http', '$timeout', TracksController]],
	['ElevationPlotController', ['$rootScope', '$scope', '$http', '$timeout', ElevationPlotController]],
	['MapController', ['$rootScope', '$scope', '$http', '$timeout', MapController]],
	['WaypointsController', ['$rootScope', '$scope', '$http', '$timeout', WaypointsController]],
];
controllers.forEach(function(ctrl) { GPXMapsControllers.controller(ctrl[0], ctrl[1]); });

var appName = 'GPXMapsApp';
var appDependencies = ['GPXMapsControllers'];  
var GPXMapsApp = angular.module(appName, appDependencies);