var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('MapCtrl', function ($scope, $http) {

	$scope.maps = [];
	$scope.mapSearchToken = '';
	$scope.matchingMaps = [];
	$scope.selectedMap = undefined;

	$scope.onMapSearchTokenChanged = function() {

		matches = [];
		for(var i in $scope.maps) {
			if ($scope.maps[i].name.toUpperCase().indexOf($scope.mapSearchToken.toUpperCase()) !== -1) {
				matches.push($scope.maps[i]);
			}
		}

		$scope.matchingMaps.length = 0;
		for(var i in matches) {
			$scope.matchingMaps.push(matches[i]);
		}

		if (matches.length > 0) {
			var bestMatch = $scope.matchingMaps[0]; 
			$scope.selectedMap = bestMatch;
		}
	};

  $http({
    url: "/getMaps/",
    headers: {
        "Content-Type": "charset=utf-8"
    }
	}).success(function(response){
	    $scope.response = response;
	}).error(function(error){
		console.log('error');
	    $scope.error = error;
	});

	$scope.$watch('response', function(json) {

		if (json == undefined) {
			return;
		}

		$scope.maps.length = 0;

		for(var i in json.maps){
			$scope.maps.push(json.maps[i]);
		}
   });

});