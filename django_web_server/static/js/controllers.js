var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('MapCtrl', function ($scope, $http, $timeout) {

	// state ------------------------------------------

	$scope.showImportSection = false;

	$scope.globalState = undefined;
	$scope.loadingState = 'loading';
	$scope.processingState = 'processing';
	$scope.viewingState = 'viewing';
	$scope.importingState = 'importing';

	$scope.mapIsLoadedAndActive = false;

	$scope.globalState = $scope.loadingState;

	$scope.returnToActiveMap = function() {
		if ($scope.mapIsLoadedAndActive == true)
			$scope.globalState = $scope.viewingState;
	};

	// CSRF -------------

	$scope.getCookie = function (name) {
	    var cookieValue = null;
	    if (document.cookie && document.cookie != '') {
	        var cookies = document.cookie.split(';');
	        for (var i = 0; i < cookies.length; i++) {
	            var cookie = cookies[i].trim();
	            if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                break;
	            }
	        }
	    }

	    return cookieValue;
	};

	$scope.genCsrfTokenDict = function() {
		var headerDict = { 'X-CSRFToken': $scope.getCookie('csrftoken') };
		return headerDict;
	};

	// import map data

	$scope.importMapDataFile = function() {

		var files = document.getElementById('ImportMapFileInput').files;
		for (var i = 0; i < files.length; i++) {
			
			var file = files[i];

			var reader = new FileReader();  

			var genOnLoad = function(fileName) {

				return function(evt) {

					var fileString = evt.target.result;

					var packet = {
						'fileName' : fileName,
						'fileString' : fileString
					};

					$http({
					    url: '/mapfile/',
					    method: 'POST',
					    data: packet,
	 					headers: $scope.genCsrfTokenDict()
					}).success(function(data, status, headers, config) {

						if (data.code == 'ok') {

							var input = document.getElementById('ImportMapFileInput');
							try{
							    input.value = '';
							    if(input.value){
							        input.type = "text";
							        input.type = "file";
							    }
							}catch(e){}

							$scope.showImportSection = false;

					    	$scope.getAndLoadMapList();

					    	// set selected map
						}
					}).error(function(data, status, headers, config) {
					    var x = data;
					    console.log(data);
					});

				};

			}

			reader.onload = genOnLoad(file.name.toString());

			reader.onerror = function(evt) {
				console.log('error reading file @ ' + file);
				console.log(evt);
			};

			reader.readAsText(file, "UTF-8");
		};

	};

	// canvas & context -------------------------------

	$scope.initCanvas = function() {

		// get window dimensions
		//
		$scope.windowWidth = window.innerWidth * 0.95; // window.screen.availWidth; // window.innerWidth;
		$scope.windowHeight = window.innerHeight * 0.90; // window.screen.availHeight; //  window.innerHeight;

		$scope.canvas = undefined;
		$scope.context = undefined;

		$scope.canvas = document.getElementById("canvas");
	    
		if ($scope.canvas.getContext) {
			$scope.context = $scope.canvas.getContext("2d");
		}

		$scope.context.canvas.width  = $scope.windowWidth;
		$scope.context.canvas.height = $scope.windowHeight;
	}

	$scope.initCanvas();

	$scope.points = [];		
	$scope.canvasPoints = [];

	$scope.waypoints = [];
	$scope.canvasWaypoints = [];	
 	
	// ------------------------------------------------

	// track attributes & stats

	$scope.trackName = '';
	$scope.trackSegmentCount = 0;

	$scope.processIncomingMapData = function(mapData) {

		$scope.trackName = mapData.name;
		console.log($scope.trackName);

		// waypoints
		//
		for(var j in mapData.waypoints) {
			
			var pointString = mapData.waypoints[j];
			var datum = pointString.split("|")		

			// 2014-10-26 11:06:15|-25.938111|27.592123|1329.160000
			// time, lat, lon, ele

			//var timeStr = datum[0];

			var lat = parseFloat(datum[0]);
			var lon = parseFloat(datum[1]);
			var ele = parseFloat(datum[2]);
			var name = datum[3];

			$scope.waypoints.push([lat,lon,ele,name]);
		}

		// segment
		//
		$scope.trackSegmentCount = mapData.segments.length;
		console.log('segments:  ' + $scope.trackSegmentCount);

		console.log('parsing points');
		// points
		//
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

		var viewPortHeight = $scope.windowHeight * 1.0;
		var viewPortWidth = $scope.windowWidth * 1.0;

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

		var transformPoint = function(lat, lon, ele, name) {

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

			d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

			if (name) {
				d['name'] = name;				
			}

			return d;
		};

		// render points to canvas space
		//
		$scope.canvasPoints.length = 0;
		for(var i in $scope.points) {
			var canvasPoint = transformPoint($scope.points[i][0], $scope.points[i][1], $scope.points[i][2]);
			$scope.canvasPoints.push(canvasPoint);
		}

		// render waypoints to canvas space
		//
		$scope.canvasWaypoints.length = 0;
		for(var i in $scope.waypoints) {
			var canvasWaypoint = transformPoint($scope.waypoints[i][0], $scope.waypoints[i][1], $scope.waypoints[i][2], $scope.waypoints[i][3]);
			$scope.canvasWaypoints.push(canvasWaypoint);
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

    	var drawTitle = function() {
			$scope.context.font = "20px helvetica";
			$scope.context.fillText($scope.trackName.toUpperCase(), 5, 20);
    	};

    	var drawWaypoints = function() {

    		// black
	  		var colorString = '#000000';			
			$scope.context.fillStyle = colorString;
			$scope.context.font = "15px helvetica";

		    for (var i in $scope.canvasWaypoints) {	
		    	
		    	var pt = $scope.canvasWaypoints[i];

				$scope.context.beginPath();

		    	$scope.context.moveTo(pt.x, pt.y);
    			$scope.context.fillRect(pt.x, pt.y, 1, 1);
    			$scope.context.stroke();
    			
    			$scope.context.beginPath();
    			$scope.context.arc(pt.x,pt.y,10,0,Math.PI*2,true);    
				$scope.context.stroke();	
				
				$scope.context.fillText(pt.name, pt.x + 20, pt.y);		
		    };	   	        
    	};

		drawElevationHalo(5);
    	drawTrail(2);
    	drawWaypoints();
    	drawTitle();

    	$scope.mapIsLoadedAndActive = true;
	};

	// ------------------------------------------------

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];

	$scope.makeGetMapCall = function(id) {

		console.log('makeGetMapCall - ajax');

		var packet = { 'id' : id };

		$http(
			{
				headers: { "Content-Type": "charset=utf-8" },
				method: 'GET',
				url: '/map/',
				params: packet
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
				method: 'GET',
				url: "/maplist/",
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