var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('MapCtrl', function ($scope, $http) {

	// state ------------------------------------------

	$scope.globalState = undefined;
	$scope.loadingState = 'loading';
	$scope.processingState = 'processing';
	$scope.viewingState = 'viewing';

	$scope.globalState = $scope.loadingState;

	// canvas & context -------------------------------

	$scope.canvas = undefined;
	$scope.context = undefined;

	$scope.initCanvas = function() {

		$scope.canvas = document.getElementById("canvas");
	    
		if ($scope.canvas.getContext) {
			$scope.context = $scope.canvas.getContext("2d");
		}
	}

	$scope.initCanvas();
 	
	// ------------------------------------------------

	$scope.processIncomingMapData = function(mapData) {

		console.log('makeGetMapCall - ajax return');

		var trackName = mapData.name;
		console.log(mapData.name);

		var segmentCount = mapData.segments.length;
		console.log(segmentCount + ' segments');

		console.log('parsing points');

		points = [];

		for(var i in mapData.segments) {

			seg = mapData.segments[i];

			for(var j in seg.points) {
				var pointString = seg.points[j];
				var datum = pointString.split("|")		

				// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
				// time, lat, lon, ele

				var timeStr = datum[0];

				var lat = parseFloat(datum[1]);
				var lon = parseFloat(datum[2]);
				var ele = parseFloat(datum[3]);

				points.push([lat,lon,ele]);
			}
		}	

		console.log('point count = ' + points.length);

		var getMinMax = function(seriesArray, seriesIndex) {

			var max = undefined;
			var min = undefined;

			for (var i = seriesArray.length - 1; i >= 0; i--) {
				
				var val = seriesArray[i][seriesIndex];

				if ((max == undefined) || (val > max)) { 
					max = val; 
				}
				if ((min == undefined) || (val < min)) { 
					min = val; 
				}
			};

			return { 'max' : max, 'min' : min };
		}		

		var minMaxLat = getMinMax(points, 0);
		var minMaxLon = getMinMax(points, 1);
		var minMaxEle = getMinMax(points, 2);

		// --------------------------------------

		var logMinMax = function(token, minMax) {
			console.log(token);
			console.log('min @ ' + minMax.min);
			console.log('max @ ' + minMax.max);
		};

		logMinMax('LAT', minMaxLat);
		logMinMax('LON', minMaxLon);
		logMinMax('ELE', minMaxEle);		

		// --------------------------------------
	};

	// ------------------------------------------------

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];

	$scope.makeGetMapCall = function(id) {

		console.log('makeGetMapCall - ajax');

		$http(
			{
				headers: { "Content-Type": "charset=utf-8" },
				method: 'GET',
				url: '/map/get/' + id,
			}
			).success(
				function(data) {
					$scope.globalState = $scope.processingState;
					$scope.processIncomingMapData(data);							
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