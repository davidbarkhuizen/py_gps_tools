var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('MapCtrl', function ($scope, $http) {

  $scope.maps = [ 'dog', 'cat' ];

  $scope.y = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  $scope.selectedMap = undefined;

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