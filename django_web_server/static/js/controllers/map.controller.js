function MapController($scope, $http, $timeout) {

	$scope.tracks = $scope.$parent.tracks;
	
	$scope.canvasElement = document
		.getElementById($scope.$parent.mapCanvasId);
	$scope.context = $scope.canvasElement.getContext("2d");

	$scope.selectionAreaElement = document
		.getElementById($scope.$parent.mapSelectionAreaDivId);

	// lat-lon view ports
	//
	$scope.latLonViewPorts = [];

	// selection area
	// 
	$scope.canvasSelections = [];

	$scope.selecting = false;
	$scope.selectionPoints = [];

	$scope.showMapSelectionArea = false;

	$scope.cancelSelection = function() {
		
		$scope.selecting = false;
		$scope.selectionPoints.length = 0;
		$scope.showMapSelectionArea = false;

		//if ($scope.show)

		$scope.makeMapOpaque();
	};

	// ZOOM IN/OUT ---------------------------------

	$scope.zoomIn = function() {

		if ($scope.selectionPoints.length !== 2) {
			throw '$scope.selectionPoints.length !== 2';
		}

		var latLon1 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[0].x, $scope.selectionPoints[0].y);
		var latLon2 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[1].x, $scope.selectionPoints[1].y);

		var minMaxLat = { 'max' : Math.max(latLon1.lat, latLon2.lat), 'min' : Math.min(latLon1.lat, latLon2.lat) };
		var minMaxLon = { 'max' : Math.max(latLon1.lon, latLon2.lon), 'min' : Math.min(latLon1.lon, latLon2.lon) };
		
		var latLonViewPort = { 'lat' : minMaxLat, 'lon' : minMaxLon };
		$scope.latLonViewPorts.push(latLonViewPort);

		$scope.canvasSelections.push([$scope.selectionPoints[0], $scope.selectionPoints[1]]);

		$scope.cancelSelection();

		$scope.draw();		
	};

	$scope.zoomOut = function() {

		if ($scope.latLonViewPorts.length == 0) {
			return;
		}

		$scope.cancelSelection();

		$scope.latLonViewPorts.pop();	
		$scope.draw($scope.tracks);

		// re-draw previous selection area	
		//	
		if ($scope.canvasSelections.length > 0) {

			var newSelection = $scope.canvasSelections.pop();

			$scope.selectionPoints.length = 0;
			$scope.selectionPoints.push(newSelection[0]);
			$scope.selectionPoints.push(newSelection[1]);

			$scope.resizeCanvasSelectionArea();		

			$scope.showMapSelectionArea = true;
		}
		else {
			$scope.selectionPoints.length = 0;
			$scope.showMapSelectionArea = false;
		}
	};

	$scope.getWindowDims = function() {

		var canvasGrandParent = $scope.canvasElement
			.parentNode
			.parentNode; 

		$scope.windowWidth = canvasGrandParent.clientWidth;
		$scope.windowHeight = canvasGrandParent.clientHeight;
	};

	$scope.sizeCanvas = function(factor) {

		// calc canvas dims
		//
		$scope.width = $scope.windowWidth * factor;
		$scope.height = $scope.windowHeight * factor;

		// set canvas dims
		//
		$scope.context.canvas.width  = $scope.width;
		$scope.context.canvas.height = $scope.height;	
	};

	$scope.initViewPort = function() {

		$scope.viewPortHeight = $scope.height * 1.0;
		$scope.viewPortWidth = $scope.width * 1.0;

		$scope.vpHalfHeight = $scope.height / 2.0;
		$scope.vpHalfWidth  = $scope.width / 2.0;

		$scope.vpAR = $scope.viewPortWidth / $scope.viewPortHeight;
	};

	$scope.calcDimensions = function() {

		$scope.minMaxEle = { 'max' : -10000.0, 'min' : 10000.0 };
		for(var t in $scope.tracks) {
			var track = $scope.tracks[t];

			if (track.minMaxEle.max >= $scope.minMaxEle.max) {
				$scope.minMaxEle.max = track.minMaxEle.max;
			}
			if (track.minMaxEle.min <= $scope.minMaxEle.min) {
				 $scope.minMaxEle.min = track.minMaxEle.min;
			}
		}

		if ($scope.latLonViewPorts.length > 0) {
			var latLonViewPort = $scope.latLonViewPorts[$scope.latLonViewPorts.length - 1];
			$scope.minMaxLat = latLonViewPort.lat;
			$scope.minMaxLon = latLonViewPort.lon;
		}
		else {
			$scope.minMaxLat = { 'max' : -180.0, 'min' : 180.0 };
			$scope.minMaxLon = { 'max' : -180.0, 'min' : 180.0 };

			for(var t in $scope.tracks) {
				var track = $scope.tracks[t];

				// lat
				//
				if (track.minMaxLat.max >= $scope.minMaxLat.max) {
					$scope.minMaxLat.max = track.minMaxLat.max;
				}
				if (track.minMaxLat.min <= $scope.minMaxLat.min) {
					 $scope.minMaxLat.min = track.minMaxLat.min;
				}

				// lon
				//
				if (track.minMaxLon.max >= $scope.minMaxLon.max) {
					$scope.minMaxLon.max = track.minMaxLon.max;
				}
				if (track.minMaxLon.min <= $scope.minMaxLon.min) {
					 $scope.minMaxLon.min = track.minMaxLon.min;
				}
			}

			var latMargin = ($scope.minMaxLat.max - $scope.minMaxLat.min) * 0.05;
			var lonMargin = ($scope.minMaxLat.max - $scope.minMaxLat.min) * 0.05;

			$scope.minMaxLat.max = $scope.minMaxLat.max + latMargin;
			$scope.minMaxLat.min = $scope.minMaxLat.min - latMargin;

			$scope.minMaxLon.max = $scope.minMaxLon.max + lonMargin;
			$scope.minMaxLon.min = $scope.minMaxLon.min - lonMargin;
		}

		$scope.latDiff = $scope.minMaxLat.max - $scope.minMaxLat.min;
		$scope.lonDiff = $scope.minMaxLon.max - $scope.minMaxLon.min;
		$scope.eleDiff = $scope.minMaxEle.max - $scope.minMaxEle.min;

		$scope.midLat = ($scope.minMaxLat.max + $scope.minMaxLat.min) / 2.0;
		$scope.midLon = ($scope.minMaxLon.max + $scope.minMaxLon.min) / 2.0;
		$scope.midEle = ($scope.minMaxEle.max + $scope.minMaxEle.min) / 2.0;
	};

	// pick scale based on aspect ratios
	//
	$scope.determineScaleFromAspectRatios = function() {

		var ar = $scope.lonDiff / $scope.latDiff;

		// too tall, use y to scale
		if (ar <= $scope.vpAR)
			$scope.scale = $scope.viewPortHeight / $scope.latDiff;
		// too wide, use x to scale
		else			
			$scope.scale = $scope.viewPortWidth / $scope.lonDiff;
	};

	$scope.transformPoint = function(lat, lon, ele, name) {

		// translate
		//
		var centeredLat = lat - $scope.midLat;
		var centeredLon = lon - $scope.midLon;

		// scale
		//
		var scaledX = centeredLon * $scope.scale;
		var scaledY = centeredLat * $scope.scale;

		// translate to viewpoint center
		//
		var x = $scope.vpHalfWidth + scaledX;
		var y = $scope.vpHalfHeight - scaledY;

		// ------------------------------------

		// colour
		//
		var k = Math.floor(255.0 * (ele - $scope.minMaxEle.min) / $scope.eleDiff);
		var rgbString = toRgbString(k, 255 - k, 0);

		d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

		if (name) {
			d['name'] = name;				
		}

		return d;
	};

	$scope.renderTrackPointsToCanvasSpace = function() {

		$scope.canvasPoints = [];

		for (var t in $scope.tracks) {

			var track = [];

			for (var s in $scope.tracks[t].segments) {
				for (var p in $scope.tracks[t].segments[s].points) {

					var point = $scope.tracks[t].segments[s].points[p];
					var canvasPoint = $scope.transformPoint(point.lat, point.lon, point.ele);
					track.push(canvasPoint);
				}
			}

			$scope.canvasPoints.push(track);
		}
	};

	$scope.renderWayPointsToCanvasSpace = function() {		

		var uniqueWaypoints = [];

		for (var t in $scope.tracks) {
			for (var p in $scope.tracks[t].waypoints) {

				var point = $scope.tracks[t].waypoints[p];

				var alreadyExists = false;
				for(var j = 0; j < uniqueWaypoints.length; j++) {

					if ((point.lat == uniqueWaypoints[j].lat) && (point.lon == uniqueWaypoints[j].lon)) {
						alreadyExists = true;
						break;
					}
				}

				if (alreadyExists == false) {
					uniqueWaypoints.push(point);
				}				
			}
		}

		$scope.canvasWaypoints = [];

		for (var i = 0; i < uniqueWaypoints.length; i++) {

			var point = uniqueWaypoints[i];
			var canvasWaypoint = $scope.transformPoint(point.lat, point.lon, point.ele, point.name);

			$scope.canvasWaypoints.push(canvasWaypoint);			
		}
	};

	$scope.blankCanvas = function() {

		$scope.context.fillStyle = '#FFFFFF'; // white
		$scope.context.fillRect(0, 0, $scope.viewPortWidth, $scope.viewPortHeight);
	};

	$scope.drawElevationHalo = function(thickness) {

		$scope.context.beginPath();
	    
		var offSet = Math.floor(thickness / 2.0);

	    for (var t in $scope.canvasPoints) {
	    	var track = $scope.canvasPoints[t];
	    	for (var i in track){ 	

		    	var pt = track[i];
				$scope.context.fillStyle = pt.rgb;	
				$scope.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);	
	    	}
	    }   

	    $scope.context.stroke();
	};

	// draw individual points
	// 
	$scope.drawTrackVertices = function(colorString, r) {

		$scope.context.beginPath();
		$scope.context.fillStyle = colorString;

	    for (var t in $scope.canvasPoints) {
	    	var track = $scope.canvasPoints[t];
	    	for (var i in track){ 	

		    	var pt = track[i];
				$scope.context.fillStyle = pt.rgb;	
				$scope.context.fillRect(pt.x - r, pt.y - r, 2*r + 1, 2*r + 1);
	    	}
	    }    

	    $scope.context.stroke();
	};

	$scope.drawEdges = function(points, thickness, color) {
		
		// style
		//
		$scope.context.lineWidth = thickness;
		$scope.context.strokeStyle = color;

		$scope.context.beginPath();
		var start = points[0];
		$scope.context.moveTo(start.x, start.y);			

	    for (var i = 1; i < points.length; i++) {	
	    	var pt = points[i];
	    	$scope.context.lineTo(pt.x, pt.y);
	    };

	    $scope.context.stroke();		        
	};
	
	// draw continuous trail
	// 
	$scope.drawAllTracksEdgesColoured = function(thickness) {    

		for (var t in $scope.canvasPoints) {
			
			var vertices = $scope.canvasPoints[t];
			var colour = $scope.tracks[t].colour;

			$scope.drawEdges(vertices, thickness, colour);
	    }    
	};

	$scope.drawWayPoint = function(cx, cy, size, color, name, font, fontSize) {

		if (color) {
			$scope.context.fillStyle = color;
			$scope.context.strokeStyle = color;
		}

		// empty square
		//
		z = Math.floor(size / 2);		
    	$scope.context.beginPath();
		$scope.context.strokeRect(cx - z, cy - z, 2*z, 2*z);
		$scope.context.stroke();		

		// with center dot
		//
    	$scope.context.beginPath();
		$scope.context.fillRect(cx, cy, 1, 1);
		$scope.context.stroke();		

		/*
		// empty circle
		//
		$scope.context.beginPath();
		$scope.context.arc(pt.x, pt.y,5,0,Math.PI*2,true);
		$scope.context.stroke();
		*/

		// text
		//
		if (name !== undefined) {
			$scope.context.font = fontSize + 'px ' + font;
			$scope.context.textBaseline = 'middle';
			$scope.context.fillText(name, cx + size, cy);
		}	
	}

	$scope.drawWaypoints = function(size, color, font, fontSize) {

		var clusterFn = function(wp1, wp2) {

			var dist = Math.sqrt(
				(wp1.x - wp2.x) * (wp1.x - wp2.x)
				+
				(wp1.y - wp2.y) * (wp1.y - wp2.y)
				);

			var result = (dist <= (2*size));

			return result;
		};

		var clusters = clusterPoints($scope.canvasWaypoints, clusterFn);

		for(var c = 0; c < clusters.length; c++) {

			var cluster = clusters[c];

			var name, x, y;

			// normal isolated waypoint
			//
			if (cluster.length == 1) {

				x = cluster[0].x;
				y = cluster[0].y;

				name = cluster[0].name; 
			}
			else { // cluster of waypoints too dense to display

				// use 1st point (should be centroid)
				//
				x = cluster[0].x;
				y = cluster[0].y;

				// concat names
				//
				var s = '';
				for (var i = 0; i < cluster.length; i++) {
					s = s + cluster[i].name  + ' | ';
				};
				s = s.slice(0, s.length - 3);
				name = s;
			}

		    $scope.drawWayPoint(x, y, size, color, name, font, fontSize);   	
		}
	};

	$scope.draw = function() {

		$scope.getWindowDims();
		$scope.sizeCanvas(0.98);
		$scope.initViewPort();
		$scope.calcDimensions();
		$scope.determineScaleFromAspectRatios();

		$scope.renderTrackPointsToCanvasSpace();
		$scope.renderWayPointsToCanvasSpace();
		
		$scope.blankCanvas();

		// $scope.drawElevationHalo();
		// $scope.drawTrackVertices('#000000', 1.0);

		$scope.drawAllTracksEdgesColoured(2);
		$scope.drawWaypoints(10, Colour.BLACK, 'helvetica', 15);
	};

	$scope.mapLatLonFromCanvasXY = function(x, y) {

		var lon = ((x - $scope.vpHalfWidth) / $scope.scale) + $scope.midLon;
		var lat = (($scope.vpHalfHeight - y) / $scope.scale) + $scope.midLat;

		return { 'lon' : lon, 'lat' : lat };
	};

	$scope.genLocationText = function(lat, lon) {
		return 'lat ' + lat.toFixed(6).toString() + ', lon ' + lon.toFixed(6).toString();
	};

	$scope.resizeCanvasSelectionArea = function() {

		var pt1 = $scope.selectionPoints[0];
		var pt2 = $scope.selectionPoints[1];

		var left = Math.min(pt1.x, pt2.x);
		var top = Math.min(pt1.y, pt2.y);
		var width = Math.abs(pt1.x - pt2.x);
		var height = Math.abs(pt1.y - pt2.y);
		
		var style  = 'left:' + left + 'px;';
		style = style + 'top:' + top + 'px;';
		style = style + 'width:' + width + 'px;';
		style = style + 'height:' + height + 'px;';

		$scope.selectionAreaElement.setAttribute('style', style);
	};

	$scope.getMousePos = function(evt) {
		var rect = $scope.canvasElement.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.makeMapOpaque = function() {
		$scope.canvasElement.setAttribute('style', 'opacity:1.0;');
	};	

	$scope.makeMapSemiTransparent = function() {
		$scope.canvasElement.setAttribute('style', 'opacity:0.5;');
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// document event handlers

	$scope.onLeftClickDown = function(mouseCanvasPos) {		

		$scope.selectionPoints.length = 0;
		$scope.selectionPoints.push(mouseCanvasPos);
		$scope.selectionPoints.push(mouseCanvasPos);

		$scope.resizeCanvasSelectionArea();

		$scope.makeMapSemiTransparent();

		$scope.selecting = true;

		$scope.showMapSelectionArea = true;
		$scope.$apply();

		$scope.$emit(Event.MAP_SELECTION_BEGUN);
	};

	$scope.onLeftClickUp = function(mousePos) {

		$scope.selectionPoints[1] = mousePos;
		$scope.resizeCanvasSelectionArea();

		$scope.selecting = false;
	};	

	$scope.onMouseMove = function(mousePos) {

		var latLon = $scope.mapLatLonFromCanvasXY(mousePos.x, mousePos.y);
		
		var locationText = $scope.genLocationText(latLon.lat, latLon.lon);
		$scope.$emit(Event.INFO_TEXT_UPDATE, locationText);

		if ($scope.selecting == true) {

			$scope.selectionPoints[1] = mousePos;
			$scope.resizeCanvasSelectionArea();
		}
	};

	// MAP MOUSE MOVE
	//
	$scope.canvasElement.addEventListener('mousemove', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		$scope.onMouseMove(mousePos);
	}, false);

	// MAP MOUSE DOWN
	//
	$scope.canvasElement.addEventListener('mousedown', function(evt) {

		var mousePos = $scope.getMousePos(evt);
		if (evt.buttons == 1) {
			$scope.onLeftClickDown(mousePos);
		}
		else if (evt.buttons == 2) {
			$scope.cancelSelection();
		}

	}, false);

	// SELECTION MOUSE UP
	//
	$scope.canvasElement.addEventListener('mouseup', function(evt) {

		if (evt.buttons == 1) {
			$scope.onLeftClickUp($scope.getMousePos(evt));
		}
		else if (evt.buttons == 2) {
			// undo last zoom
		}

	}, false);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// handlers for angular.js events

	$scope.$on(Event.MAP_REFRESH, function(evt) {
		$scope.draw();
	});

	$scope.$on(Event.CANCEL_MAP_SELECTION, function(evt) {
		$scope.cancelSelection();
	});

	$scope.$on(Event.MAP_ZOOM_IN, function(evt) {
		$scope.zoomIn();
	});

	$scope.$on(Event.MAP_ZOOM_OUT, function(evt) {
		$scope.zoomOut();
	});
}