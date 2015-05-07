var appName = 'geoNodeTekApp';
var appDependencies = ['GeoNodeTekControllers'];  

var geoNodeTekApp = angular.module(appName, appDependencies);

var geoNodeTekControllers = angular.module('GeoNodeTekControllers', []);

// GodController
//
geoNodeTekControllers.controller(
	'GodController', ['$scope', '$http', '$timeout', GodController]
);

// TrackListController
//
geoNodeTekControllers.controller(
	'TrackListController', ['$scope', '$http', '$timeout', TrackListController]
);

// ElevationPlotController
//
geoNodeTekControllers.controller(
	'ElevationPlotController', ['$scope', '$http', '$timeout', ElevationPlotController]
);