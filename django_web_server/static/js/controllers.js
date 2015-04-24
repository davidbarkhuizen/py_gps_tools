var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('GeoNodeTekController', function ($scope, $http, $timeout) {

	// django anti-CSRF token -------------

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

	// map list, filter token, filtered list, selected item ------------

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];

	// MAP LIST -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.getMapList = function() {

		var headers = { "Content-Type": "charset=utf-8" };
		var request = { method: 'GET', url: "/maplist/", headers: headers };

		var successFn = function(response) { 
			$scope.loadMapList(response.maps); 
		};
		var errorFn = function(error){
			console.log('error');
			$scope.error = error;
			throw error;
		};

		$http(request).success(successFn).error(errorFn);
	};

	$scope.loadMapList = function(mapList) {

		$scope.mapList.length = 0;
		for(var i in mapList){
			$scope.mapList.push(mapList[i]);
		}

		$scope.filterMapList();
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.filterMapList = function() {		

		matches = [];

		// filter to matches
		//
		for(var i in $scope.mapList) {
			if ($scope.mapList[i].name.toUpperCase().indexOf($scope.mapSearchToken.toUpperCase()) !== -1) {
				matches.push($scope.mapList[i]);
			}
		}

		// sort matches
		//
		matches.sort(function(a, b) { return a > b; });

		// update filtered map list
		//
		$scope.filteredMapList.length = 0;
		if (matches.length > 0) {			
			for(var i in matches) {
				$scope.filteredMapList.push(matches[i]);
			}
		}

		// auto-select from matches
		//
		$scope.selectedMap.length = 0;
		if (!(($scope.filteredMapList == undefined) || ($scope.filteredMapList.length == 0))) {
			$scope.selectedMap.push($scope.filteredMapList[0]);
		}
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.mapIsLoadedAndActive = false;

	// show/hide ui sections and navigation ---------------------------

	$scope.showMetaOptions = true;
	$scope.showMap = false;
	$scope.showImportSection = false;

	$scope.returnToActiveMap = function() {
		if ($scope.mapIsLoadedAndActive == true) {
			$scope.showMetaOptions = false;
			$scope.showMap = true;
		}
	};

	$scope.gotoControls = function() {
		$scope.showMap = false;
		$scope.showMetaOptions = true;
		$timeout(function() { document.getElementById("MapListFilterToken").focus(); }, 0 );  	    
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.getMap = function(id) {

		var req =
			{
				headers: { "Content-Type": "charset=utf-8" },
				method: 'GET',
				url: '/map/',
				params: { 'id' : id }
			};

		var successFn = function(data) { 
			$scope.processIncomingTrackData(data); 
		};

		var errorFn = function(error){
			console.log('error');
			$scope.error = error;
		};

		$http(req)
		.success(successFn)
		.error(errorFn);
	};	

	$scope.loadSelectedMap = function(){

		if (($scope.selectedMap == undefined) || ($scope.selectedMap.length == 0))
			return;

		$scope.getMap($scope.selectedMap[0].id);
	};
	
	$scope.selectMapById = function(id) {

		if ($scope.selectedMap.id == id)
			return;

		for (var i in $scope.filteredMapList) {
			if ($scope.filteredMapList[i].id == id) {
				$scope.selectedMap.length = 0;
				$scope.selectedMap.push($scope.filteredMapList[i]);
				break;
			}
		}
	};

	$scope.mapListItemClicked = function(mapId) {
		$scope.selectMapById(mapId);
		$scope.loadSelectedMap();
	};

	// -------------------------------------------------------

	$scope.postMapDataFiles = function() {

		var postMapDataFilesRecursive = function(files) {

			var file = files[0];

			var remainder = [];
			for (var i = 1; i < files.length; i++) {
				remainder.push(files[i])
			};

			var clearInput = function(id) {

				var input = document.getElementById(id);
				try{
				    input.value = '';
				    if(input.value){
				        input.type = "text";
				        input.type = "file";
				    }
				} catch(e){

				}
			};

			var onLoad = function(evt) {

					var packet = {
						'fileName' : file.name,
						'fileString' : evt.target.result
					};

					var successFn = function(data, status, headers, config) {

						if (data.code == 'ok') {

					    	$scope.getMapList();

					    	if (remainder.length == 0) {
				    			$scope.showImportSection = false;
				    		}
				    	}						

				    	if (remainder.length > 0) {
				    		postMapDataFilesRecursive(remainder);
				    	}
					};

					$http({
					    url: '/mapfile/',
					    method: 'POST',
					    data: packet,
	 					headers: $scope.genCsrfTokenDict()
					}).success(successFn).error(function(data, status, headers, config) {
					    console.log('ERROR:  ' + data);
					});

				};

			var reader = new FileReader(); 

			reader.onload = onLoad; 

			reader.onerror = function(evt) {
				console.log('error reading file @ ' + file);
				console.log(evt);
				console.log('terminating');
			};

			reader.readAsText(file, "UTF-8");
		};

		var files = document.getElementById('ImportMapFileInput').files;
		postMapDataFilesRecursive(files);
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

	$scope.canvasPoints = [];
	$scope.canvasWaypoints = [];	
 	
	// ------------------------------------------------

	// track attributes & stats

	$scope.trackName = '';
	$scope.trackSegmentCount = 0;

	$scope.processIncomingTrackData = function(trackData) {

		var track = new Track(trackData);

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
			//var rgbString = toRgbString(red, 255 - red, 125);
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

    	var drawWaypoints = function() {

    		// black
	  		var colorString = '#000000';			
			$scope.context.fillStyle = colorString;
			$scope.context.font = "15px helvetica";

	    	var displayedPoints = [];

			var contains = function(container, contained, radius) {

				var containsX = ((container.x + 2*radius >= contained.x) && (container.x - 2*radius <= contained.x));
				var containsY = ((container.y + 2*radius >= contained.y) && (container.y - 2*radius <= contained.y));
			
				return containsX && containsY;
			};

			var displayedPointsContains = function(contained, radius) {

				for(var i in displayedPoints) {
					if (contains(displayedPoints[i], contained, radius))
						return true;
				}

				return false;
			};

			var hideOverlappingPoints = true;

			$scope.context.font = "20px helvetica";

		    for (var i in $scope.canvasWaypoints) {	
		    	
		    	var pt = $scope.canvasWaypoints[i];		    	

		    	var drawPoint = true;

		    	if (hideOverlappingPoints) {
			    	if (displayedPointsContains(pt, 10) == true) {
			    		drawPoint = false;
			    	} else {
			    		displayedPoints.push(pt);
			    	}
			    }

		    	if (drawPoint == true) {					

			    	$scope.context.moveTo(pt.x - 5, pt.y - 5);
			    	$scope.context.beginPath();
	    			$scope.context.fillRect(pt.x - 5, pt.y - 5, 10, 10);
	    			$scope.context.stroke();
	    			
					$scope.context.fillText(pt.name, pt.x - 5, pt.y - 10);	
				}	
		    };	   	        
    	};

		drawElevationHalo(5);
    	drawTrail(2);
    	drawWaypoints();

    	$scope.mapIsLoadedAndActive = true;
    	$scope.showMetaOptions = false;
    	$scope.showMap = true;
	};

	$scope.getMapList();
	$timeout(function() { document.getElementById("MapListFilterToken").focus(); }, 0 );
});