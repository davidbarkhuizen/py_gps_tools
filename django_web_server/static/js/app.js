var appName = 'geoNodeTekApp';
var appDependencies = ['GeoNodeTekControllers'];  

var geoNodeTekApp = angular.module(appName, appDependencies);

var geoNodeTekControllers = angular.module('GeoNodeTekControllers', []);

geoNodeTekControllers.controller(
	'GodController', ['$scope', '$http', '$timeout', GodController]
);

geoNodeTekControllers.controller(
	'TrackListController', ['$scope', '$http', '$timeout', TrackListController]
);