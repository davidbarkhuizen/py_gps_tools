var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('MapCtrl', function ($scope, $http) {

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];

	$scope.makeGetMapCall = function(mapId) {

		$http(
			{
				headers: { "Content-Type": "charset=utf-8" },
				method: 'GET',
				url: '/map/get/3/',
				data: { 'Id' : mapId }
			}
			).success(
				function(data) {
					console.log(data);				
				}
			).error(
				function(error){
					console.log('error');
			    	$scope.error = error;
				}
			);
	};

	$scope.loadSelectedMap = function(){

		if (($scope.selectedMap == undefined) || ($scope.selectedMap.length == 0)) {
		}
		else {
			$scope.makeGetMapCall($scope.selectedMap[0].id);		
		}
	};

	$scope.loadMapList = function(mapList) {

		$scope.mapList.length = 0;
		$scope.filteredMapList.length = 0;

		for(var i in mapList){
			$scope.mapList.push(mapList[i]);
			$scope.filteredMapList.push(mapList[i]);
		}
	};

	$scope.getAndLoadMapList = function() {

		$http(
			{
				url: "/maps/get/",
				headers: { "Content-Type": "charset=utf-8" }
			}
			).success(
				function(response) {
					$scope.loadMapList(response.maps);				
				}
			).error(
				function(error){
					console.log('error');
			    	$scope.error = error;
				}
			);
	};

	$scope.onMapSearchTokenChanged = function() {

		matches = [];

		// filter
		for(var i in $scope.mapList) {
			if ($scope.mapList[i].name.toUpperCase().indexOf($scope.mapSearchToken.toUpperCase()) !== -1) {
				matches.push($scope.mapList[i]);
			}
		}

		// sort
		matches.sort(function(a, b) { return a > b; });

		// update fitered map list

		$scope.filteredMapList.length = 0;

		if (matches.length > 0) {
			
			for(var i in matches) {
				$scope.filteredMapList.push(matches[i]);
			}
		}

		// update selected map / autop-select map

		var tokenIsBlank = ($scope.mapSearchToken == '') 
			|| ($scope.mapSearchToken == undefined); 

		$scope.selectedMap.length = 0;

		if (
			(tokenIsBlank)
			|| ($scope.filteredMapList == undefined)
			|| ($scope.filteredMapList.length == 0)
			) {
			
		}
		else {
			$scope.selectedMap.length = 0;
			$scope.selectedMap.push($scope.filteredMapList[0]); 		
		}

	};

	$scope.getAndLoadMapList();
});