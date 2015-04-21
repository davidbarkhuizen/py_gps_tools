var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('MapCtrl', function ($scope, $http, $timeout) {

	// state ------------------------------------------

	$scope.globalState = undefined;
	$scope.loadingState = 'loading';
	$scope.processingState = 'processing';
	$scope.viewingState = 'viewing';

	$scope.mapIsLoadedAndActive = false;

	$scope.globalState = $scope.loadingState;

	$scope.returnToActiveMap = function() {
		if ($scope.mapIsLoadedAndActive == true)
			$scope.globalState = $scope.viewingState;
	};

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

	$scope.points = [];	
	$scope.canvasPoints = [];	
 	
	// ------------------------------------------------

	$scope.processIncomingMapData = function(mapData) {

		var trackName = mapData.name;
		console.log(mapData.name);

		var segmentCount = mapData.segments.length;
		console.log('segments:  ' + segmentCount);

		console.log('parsing points');

		$scope.points.length = 0;

		for(var i in mapData.segments) {

			seg = mapData.segments[i];

			for(var j in seg.points) {
				var pointString = seg.points[j];
				var datum = pointString.split("|")		

				// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
				// time, lat, lon, ele

				//var timeStr = datum[0];

				var lat = parseFloat(datum[0]);
				var lon = parseFloat(datum[1]);
				var ele = parseFloat(datum[2]);

				$scope.points.push([lat,lon,ele]);
			}
		}	

		var pointCount = $scope.points.length;
		console.log('point count:  ' + pointCount);

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

		var minMaxLat = getMinMax($scope.points, 0);
		var minMaxLon = getMinMax($scope.points, 1);
		var minMaxEle = getMinMax($scope.points, 2);

		var eleDiff = minMaxEle.max - minMaxEle.min;

		var latDiff = minMaxLat.max - minMaxLat.min;
		var lonDiff = minMaxLon.max - minMaxLon.min;
		var latlonAR = lonDiff / latDiff;

		// --------------------------------------

		var logMinMax = function(token, minMax) {
			console.log(token + ' E [' + minMax.min + ', ' + minMax.max + ']');
		};

		logMinMax('Lat', minMaxLat);
		logMinMax('Lon', minMaxLon);
		logMinMax('Ele', minMaxEle);		

		// --------------------------------------

		// viewport

		var viewPortHeight = 550.0;
		var viewPortWidth = 880.0;

		var vpHalfHeight = viewPortHeight / 2.0;
		var vpHalfWidth  = viewPortWidth / 2.0;

		var vpAR = viewPortWidth / viewPortHeight;

		var scale = undefined;
		if (latlonAR <= vpAR) {
			// too tall, use y to scale
			scale = viewPortHeight / latDiff;
		}
		else
		{
			// too wide, use x to scale
			scale = viewPortWidth / lonDiff;
		}

		var midLat = 0.5 * (minMaxLat.max + minMaxLat.min);
		var midLon = 0.5 * (minMaxLon.max + minMaxLon.min);
		var midEle = 0.5 * (minMaxEle.max + minMaxEle.min);

		var toRgbString = function(r, g, b) {
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		};

		var transformPoint = function(lat, lon, ele) {

			// translate to center around origin
			var centeredLat = lat - midLat;
			var centeredLon = lon - midLon;

			// scale
			var scaledX = centeredLon * scale;
			var scaledY = centeredLat * scale;

			// translate to viewpoint center
			var x = vpHalfWidth + scaledX;
			var y = vpHalfHeight - scaledY;

			// COLOR			
			var red = Math.floor(255.0 * (ele - minMaxEle.min) / eleDiff);
			var rgbString = toRgbString(red, 255 - red, 0);

			return { 'x' : x, 'y' : y, 'rgb' : rgbString };
		};

		// render points to canvas space
		//
		$scope.canvasPoints.length = 0;
		for(var i in $scope.points) {
			var canvasPoint = transformPoint($scope.points[i][0], $scope.points[i][1], $scope.points[i][2]);
			$scope.canvasPoints.push(canvasPoint);
		}

		// draw from canvas space to canvas
		//
		$scope.context.fillStyle = '#FFFFFF';
  		$scope.context.fillRect(0,0,viewPortWidth,viewPortHeight);

        // elevation halo
        
        var drawElevationHalo = function(thickness) {

			$scope.context.beginPath();
		    
			var offSet = Math.floor(thickness / 2.0);

		    for (var i in $scope.canvasPoints) {	
		    	var pt = $scope.canvasPoints[i];
	    		$scope.context.fillStyle = pt.rgb;	
				$scope.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);	
		    };	   

	        $scope.context.stroke();
        };

        var drawTrail = function(thickness) {		

	  		// black
	  		var colorString = '#000000'; 

			$scope.context.beginPath();
			$scope.context.fillStyle = colorString;

			var offSet = Math.floor(thickness / 2.0);

		    for (var i in $scope.canvasPoints) {	
		    	var pt = $scope.canvasPoints[i];
	    			$scope.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);
		    };	    

	        $scope.context.stroke();

    	};

		drawElevationHalo(5);
    	drawTrail(2);

    	$scope.mapIsLoadedAndActive = true;
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

	// MAP LIST = get/load, filter , item-clicked -----------

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

	$scope.mapListItemClicked = function(mapId) {

		// set $scope.selectedMap
		//
		for (var i in $scope.filteredMapList) {
			if ($scope.filteredMapList[i].id == mapId) {
				$scope.selectedMap.length = 0;
				$scope.selectedMap.push($scope.filteredMapList[i]);
				break;
			}
		}

		$scope.makeGetMapCall($scope.selectedMap[0].id);
	};

	// -------------------------------------------------------
	// navigation functions

	$scope.gotoOptions = function() {

		$scope.globalState = $scope.loadingState;  	    
		$timeout(function() { document.getElementById("MapListFilterToken").focus(); }, 0 );  	    
	};

	// -------------------------------------------------------

	$scope.getAndLoadMapList();
	$timeout(function() { document.getElementById("MapListFilterToken").focus(); }, 0 );
});