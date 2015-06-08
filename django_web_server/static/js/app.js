var GPXMapsControllers = angular.module('GPXMapsControllers', ['ui.grid', 'ui.grid.selection']);

var commonDependencies = [ '$rootScope', '$scope', '$http', '$timeout']; 

var controllers = [
	['GodController', commonDependencies.concat([GodController])],

	['GpxImportController', commonDependencies.concat([GpxImportController])],
	['GpxExportController', commonDependencies.concat([GpxExportController])],

	['GpxDatabaseController', commonDependencies.concat([GpxDatabaseController])],
	['GpxController', commonDependencies.concat([GpxController])],

	['TracksController', commonDependencies.concat([TracksController])],
	['ElevationPlotController', commonDependencies.concat([ElevationPlotController])],
	['MapController', commonDependencies.concat([MapController])],
	['WaypointsController', commonDependencies.concat([WaypointsController])],
];
controllers.forEach(function(ctrl) { GPXMapsControllers.controller(ctrl[0], ctrl[1]); });

var appName = 'GPXMapsApp';
var appDependencies = ['GPXMapsControllers'];  
var GPXMapsApp = angular.module(appName, appDependencies);