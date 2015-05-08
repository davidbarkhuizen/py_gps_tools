var PlotType = Object.freeze({
	ELEVATION : 0,
	EDGES : 1,
	VERTICES : 2
});

function MapController($scope, $http, $timeout) {

	$scope.canvasId = $scope.$parent.mapCanvasId;

	$scope.plotType = PlotType.EDGES;

	$scope.selecting = false;
	$scope.mouseDownPos = null;
	$scope.mouseUpPos = null;

	// MAP VIEW PORT

	$scope.mapCanvasSelections = [];

	$scope.mapViewPorts = [];
	$scope.mapViewPort = function() {
		return $scope.mapViewPorts[$scope.mapViewPorts.length - 1];
	};

	$scope.useMapViewPort = false;

	$scope.cancelSelection = function() {
		$scope.clearMapSelectionOutline();

		$scope.selecting = false;
		$scope.mouseDownPos = null;
		$scope.mouseUpPos = null;		
	};

	// ZOOM IN/OUT ---------------------------------

	this.zoomIn = function() {

		if (($scope.mouseDownPos == null) || ($scope.mouseUpPos == null))
			return;

		var latLonDown = $scope.mapLatLonFromCanvasXY($scope.mouseDownPos.x, $scope.mouseDownPos.y);
		var latLonUp = $scope.mapLatLonFromCanvasXY($scope.mouseUpPos.x, $scope.mouseUpPos.y);

		var minMaxLat = { 'max' : Math.max(latLonDown.lat, latLonUp.lat), 'min' : Math.min(latLonDown.lat, latLonUp.lat) };
		var minMaxLon = { 'max' : Math.max(latLonDown.lon, latLonUp.lon), 'min' : Math.min(latLonDown.lon, latLonUp.lon) };
		
		var mapViewPort = { 'lat' : minMaxLat, 'lon' : minMaxLon };

		$scope.mapViewPorts.push(mapViewPort);
		$scope.mapCanvasSelections.push([$scope.mouseDownPos, $scope.mouseUpPos]);

		$scope.useMapViewPort = true;

		$scope.draw($scope.tracks);		

		$scope.clearMapSelectionOutline();
		$scope.mouseDownPos = null;
		$scope.mouseUpPos = null;
	};

	this.zoomOut = function() {

		if ($scope.mapViewPorts.length == 0)
			return;

		$scope.clearMapSelectionOutline();
		
		$scope.mapViewPorts.pop();		
		var canvasSelection = $scope.mapCanvasSelections.pop();

		if ($scope.mapViewPorts.length > 0)
			$scope.draw($scope.tracks);
		else
			$scope.draw($scope.tracks, true);

		if (canvasSelection != null) {
			$scope.drawCanvasSelectionAreaFrom2Points($scope.canvasSelectionAreaDivId, canvasSelection[0], canvasSelection[1]);		
			$scope.mouseDownPos = canvasSelection[0];
			$scope.mouseUpPos = canvasSelection[1];
		}
	};

	var constructContext = function() {
		
		$scope.canvas = document.getElementById(canvasId);

		if ($scope.canvas.getContext) {
			$scope.context = $scope.canvas.getContext("2d");
		}
	};

	var init = function() {
		constructContext();
	};

	init();

	$scope.draw = function(tracks, resetMapViewPort) {

		$scope.tracks = tracks;

		if (resetMapViewPort == true) {
			$scope.useMapViewPort = false;
			$scope.cancelSelection();
		}

		this.getWindowDims = function() {

			$scope.windowWidth = document.getElementById(canvasId).parentNode.parentNode.clientWidth;
			$scope.windowHeight = document.getElementById(canvasId).parentNode.parentNode.clientHeight;
		};

		this.sizeCanvas = function() {

			// calc canvas dims
			//
			$scope.width = $scope.windowWidth * 0.98;
			$scope.height = $scope.windowHeight * 0.98;

			// set canvas dims
			//
			$scope.context.canvas.width  = $scope.width;
			$scope.context.canvas.height = $scope.height;	
		};

		this.initViewPort = function() {

			$scope.viewPortHeight = $scope.height * 1.0;
			$scope.viewPortWidth = $scope.width * 1.0;

			$scope.vpHalfHeight = $scope.height / 2.0;
			$scope.vpHalfWidth  = $scope.width / 2.0;

			$scope.vpAR = $scope.viewPortWidth / $scope.viewPortHeight;
		};

		this.calcDimensions = function() {

			$scope.minMaxEle = { 'max' : -10000.0, 'min' : 10000.0 };
			for(var t in tracks) {
				var track = tracks[t];

				if (track.minMaxEle.max >= $scope.minMaxEle.max) {
					$scope.minMaxEle.max = track.minMaxEle.max;
				}
				if (track.minMaxEle.min <= $scope.minMaxEle.min) {
					 $scope.minMaxEle.min = track.minMaxEle.min;
				}
			}

			if ($scope.useMapViewPort == true) {
				var mapViewPort = $scope.mapViewPort();
				$scope.minMaxLat = mapViewPort.lat;
				$scope.minMaxLon = mapViewPort.lon;
			}
			else {
				$scope.minMaxLat = { 'max' : -180.0, 'min' : 180.0 };
				$scope.minMaxLon = { 'max' : -180.0, 'min' : 180.0 };

				for(var t in tracks) {
					var track = tracks[t];

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
		this.determineScaleFromAspectRatios = function() {

			var ar = $scope.lonDiff / $scope.latDiff;

			if (ar <= $scope.vpAR) {
				// too tall, use y to scale
				$scope.scale = $scope.viewPortHeight / $scope.latDiff;
			}
			else {
				// too wide, use x to scale
				$scope.scale = $scope.viewPortWidth / $scope.lonDiff;
			}
		};

		this.transformPoint = function(lat, lon, ele, name) {

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

		this.renderTrackPointsToCanvasSpace = function() {

			$scope.canvasPoints = [];

			for (var t in tracks) {

				var track = [];

				for (var s in tracks[t].segments) {
					for (var p in tracks[t].segments[s].points) {

						var point = tracks[t].segments[s].points[p];
						var canvasPoint = this.transformPoint(point.lat, point.lon, point.ele);
						track.push(canvasPoint);
					}
				}

				$scope.canvasPoints.push(track);
			}
		};

		this.renderWayPointsToCanvasSpace = function() {

			$scope.canvasWaypoints = [];

			for (var t in tracks) {
				for (var wp in tracks[t].waypoints) {

					var point = tracks[t].waypoints[wp];
					var canvasWaypoint = this.transformPoint(point.lat, point.lon, point.ele, point.name);

					$scope.canvasWaypoints.push(canvasWaypoint);
				}
			}
		};

		this.blankCanvas = function() {

			$scope.context.fillStyle = '#FFFFFF'; // white
			$scope.context.fillRect(0, 0, $scope.viewPortWidth, $scope.viewPortHeight);
		};

		this.drawElevationHalo = function(thickness) {

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
		this.drawTrackVertices = function(colorString, r) {

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

		this.drawEdges = function(points, thickness, color) {
			
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
		this.drawAllTracksEdgesColoured = function(thickness) {    

			for (var t in $scope.canvasPoints) {
				
				var vertices = $scope.canvasPoints[t];
				var color = $scope.tracks[t].color;

				$scope.drawEdges(vertices, thickness, color);
		    }    
		};

		this.drawWaypoints = function(colorString, fontString) {

			$scope.context.fillStyle = colorString;
			$scope.context.font = fontString;

			// overlap determination ---------------

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

			var hideOverlappingPoints = false;

			// --------------------------------

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

		    		var z = 4;
			    	$scope.context.moveTo(pt.x - z, pt.y - z);
			    	$scope.context.beginPath();
					$scope.context.fillRect(pt.x - z, pt.y - z, 2*z, 2*z);
					$scope.context.stroke();		
					
					/*
					$scope.context.fillRect(pt.x, pt.y, 1, 1);
					$scope.context.beginPath();
					$scope.context.arc(pt.x, pt.y,5,0,Math.PI*2,true);
					$scope.context.stroke();
					*/

					$scope.context.fillText(pt.name, pt.x - 5, pt.y - 10);	
				}	
		    };	   	
		};

		this.getWindowDims();
		this.sizeCanvas(0.90);
		this.initViewPort();
		this.calcDimensions();
		this.determineScaleFromAspectRatios();

		this.renderTrackPointsToCanvasSpace();
		this.renderWayPointsToCanvasSpace();
		
		this.blankCanvas();
		
		switch (this.plotType) {
			case PlotType.ELEVATION: this.drawElevationHalo(); break;
			case PlotType.EDGES: this.drawAllTracksEdgesColoured(2); break;
			case PlotType.VERTICES: this.drawTrackVertices('#000000', 1.0); break;
			default: result = 'unknown';
		}

		this.drawWaypoints('#000000', '15px courier');
	};

	this.mapLatLonFromCanvasXY = function(x, y) {

		var lon = ((x - $scope.vpHalfWidth) / $scope.scale) + $scope.midLon;
		var lat = (($scope.vpHalfHeight - y) / $scope.scale) + $scope.midLat;

		return { 'lon' : lon, 'lat' : lat };
	};

	this.clearMapSelectionOutline = function() {
		var baseStyle = 'position: absolute; z-index: 20; border-color:black;border-width:1px;border-style:dotted;';
		var selectionAreaDiv = document.getElementById($scope.canvasSelectionAreaDivId);
		selectionAreaDiv.setAttribute('style', baseStyle);
	};

	// EVENT HANDLERS ========================================================

	this.getMousePos = function(evt) {
		var rect = $scope.canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};

	this.onMapLeftClickDown = function(mouseCanvasPos) {

		$scope.selecting = true;
		$scope.mouseDownPos = mouseCanvasPos;
	};

	this.onMapLeftClickUp = function() {

		$scope.selecting = false;
		$scope.mouseUpPos = $scope.mouseLastPos;
	};

	this.genLocationString = function(lat, lon) {
		return 'lat ' + lat.toFixed(6).toString() + ', lon ' + lon.toFixed(6).toString();
	};

	this.drawCanvasSelectionArea = function(docId, top, left, height, width) {
		
		var el = document.getElementById(docId);

		var baseStyle = 'position: absolute; z-index: 20; border-color:orange;border-width:2px;border-style:dashed;';
		
		var style  = baseStyle + 'left:' + left + 'px;';
		style = style + 'top:' + top + 'px;';
		style = style + 'width:' + width + 'px;';
		style = style + 'height:' + height + 'px;';

		el.setAttribute('style', style);
	};

	this.drawCanvasSelectionAreaFrom2Points = function(id, pt1, pt2) {

		var left = Math.min(pt1.x, pt2.x);
		var top = Math.min(pt1.y, pt2.y);
		var width = Math.abs(pt1.x - pt2.x);
		var height = Math.abs(pt1.y - pt2.y);

		$scope.drawCanvasSelectionArea(id, top, left, height, width);
	};

	this.onMapMouseMove = function(mousePos) {

		var latLon = $scope.mapLatLonFromCanvasXY(mousePos.x, mousePos.y);
		$scope.updateInfoString($scope.genLocationString(latLon.lat, latLon.lon));

		if ($scope.selecting == true) {

			$scope.mouseLastPos = mousePos;
			$scope.drawCanvasSelectionAreaFrom2Points($scope.canvasSelectionAreaDivId, $scope.mouseDownPos, $scope.mouseLastPos);
		}
	};

	// MAP MOUSE MOVE
	//
	this.canvas.addEventListener('mousemove', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		$scope.onMapMouseMove(mousePos);
	}, false);

	// MAP MOUSE DOWN
	//
	this.canvas.addEventListener('mousedown', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		if (evt.buttons == 1) {
			$scope.onMapLeftClickDown(mousePos);
		}
		else if (evt.buttons == 2) {
		}

	}, false);

	var selectionAreaDiv = document.getElementById('CanvasSelectionArea');

	// SELECTION MOUSE UP
	//
	selectionAreaDiv.addEventListener('mouseup', function(evt) {

		if (evt.buttons == 1) {
			$scope.onMapLeftClickUp($scope.getMousePos(evt));
		}
		else if (evt.buttons == 2) {
			// undo last zoom
		}

	}, false);
}