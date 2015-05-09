var MapPlotType = Object.freeze({
	ELEVATION : 0,
	EDGES : 1,
	VERTICES : 2
});

function MapController($scope, $http, $timeout) {
	
	$scope.canvasElement = document
		.getElementById($scope.$parent.mapCanvasId);

	$scope.selectionAreaElement = document
		.getElementById($scope.$parent.mapCanvasSelectionAreaDivId);
	
	$scope.plotType = MapPlotType.EDGES;

	$scope.tracks = $scope.$parent.tracks;

	$scope.context = $scope.canvasElement.getContext("2d");

	// selection area
	// 
	$scope.mapCanvasSelections = [];
	$scope.selecting = false;
	$scope.mouseDownPos = null;
	$scope.mouseUpPos = null;

	// map view port
	//
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

	$scope.zoomIn = function() {

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

		$scope.draw();		

		$scope.clearMapSelectionOutline();
		$scope.mouseDownPos = null;
		$scope.mouseUpPos = null;
	};

	$scope.zoomOut = function() {

		if ($scope.mapViewPorts.length == 0)
			return;

		$scope.clearMapSelectionOutline();
		
		$scope.mapViewPorts.pop();		
		var canvasSelection = $scope.mapCanvasSelections.pop();

		if ($scope.mapViewPorts.length > 0)
			$scope.draw($scope.tracks)
		else
			$scope.draw($scope.tracks, true);

		if (canvasSelection != null) {
			$scope.drawCanvasSelectionAreaFrom2Points(canvasSelection[0], canvasSelection[1]);		
			$scope.mouseDownPos = canvasSelection[0];
			$scope.mouseUpPos = canvasSelection[1];
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

		if ($scope.useMapViewPort == true) {
			var mapViewPort = $scope.mapViewPort();
			$scope.minMaxLat = mapViewPort.lat;
			$scope.minMaxLon = mapViewPort.lon;
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

		$scope.canvasWaypoints = [];

		for (var t in $scope.tracks) {
			for (var wp in $scope.tracks[t].waypoints) {

				var point = $scope.tracks[t].waypoints[wp];
				var canvasWaypoint = $scope.transformPoint(point.lat, point.lon, point.ele, point.name);

				$scope.canvasWaypoints.push(canvasWaypoint);
			}
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
			var color = $scope.tracks[t].color;

			$scope.drawEdges(vertices, thickness, color);
	    }    
	};

	$scope.drawWayPoint = function(cx, cy, size, color, name, font, fontSize) {

		if (color) {
			$scope.context.fillStyle = color;
			$scope.strokeStyle = color;
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
		$scope.context.fillRect(pt.x, pt.y, 1, 1);
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

			var result = (dist <= size);

			return result;
		};

		var clusters = clusterPoints($scope.canvasWaypoints, clusterFn);

		for(var c = 0; c <= clusters.length; c++) {

			var cluster = clusters[c];

			var name, x, y;

			if (cluster.length == 1) {
				x = cluster[0].x;
				y = cluster[0].y;

				name = cluster[0].name; 
			}
			else {

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

	$scope.draw = function(resetMapViewPort) {

		if (resetMapViewPort == true) {
			$scope.useMapViewPort = false;
			$scope.cancelSelection();
		}

		$scope.getWindowDims();
		$scope.sizeCanvas(0.98);
		$scope.initViewPort();
		$scope.calcDimensions();
		$scope.determineScaleFromAspectRatios();

		$scope.renderTrackPointsToCanvasSpace();
		$scope.renderWayPointsToCanvasSpace();
		
		$scope.blankCanvas();

		switch ($scope.plotType) {
			case MapPlotType.ELEVATION: $scope.drawElevationHalo(); break;
			case MapPlotType.EDGES: $scope.drawAllTracksEdgesColoured(2); break;
			case MapPlotType.VERTICES: $scope.drawTrackVertices('#000000', 1.0); break;
			default: throw "unknown $scope.MapPlotType:" + $scope.MapPlotType;
		}

		$scope.drawWaypoints(10, '#000000', 'helvetica', 15);
	};

	$scope.mapLatLonFromCanvasXY = function(x, y) {

		var lon = ((x - $scope.vpHalfWidth) / $scope.scale) + $scope.midLon;
		var lat = (($scope.vpHalfHeight - y) / $scope.scale) + $scope.midLat;

		return { 'lon' : lon, 'lat' : lat };
	};

	$scope.clearMapSelectionOutline = function() {
		var baseStyle = 'position: absolute; z-index: 20; border-color:black;border-width:1px;border-style:dotted;';
		$scope.selectionAreaElement.setAttribute('style', baseStyle);
	};

	// EVENT HANDLERS ========================================================

	$scope.getMousePos = function(evt) {
		var rect = $scope.canvasElement.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};

	$scope.onMapLeftClickDown = function(mouseCanvasPos) {

		$scope.selecting = true;
		$scope.mouseDownPos = mouseCanvasPos;
	};

	$scope.onMapLeftClickUp = function() {

		$scope.selecting = false;
		$scope.mouseUpPos = $scope.mouseLastPos;
	};

	$scope.genLocationString = function(lat, lon) {
		return 'lat ' + lat.toFixed(6).toString() + ', lon ' + lon.toFixed(6).toString();
	};

	$scope.drawCanvasSelectionArea = function(top, left, height, width) {
		
		var baseStyle = 'position: absolute; z-index: 20; border-color:orange;border-width:2px;border-style:dashed;';
		
		var style  = baseStyle + 'left:' + left + 'px;';
		style = style + 'top:' + top + 'px;';
		style = style + 'width:' + width + 'px;';
		style = style + 'height:' + height + 'px;';

		$scope.selectionAreaElement.setAttribute('style', style);
	};

	$scope.drawCanvasSelectionAreaFrom2Points = function(pt1, pt2) {

		var left = Math.min(pt1.x, pt2.x);
		var top = Math.min(pt1.y, pt2.y);
		var width = Math.abs(pt1.x - pt2.x);
		var height = Math.abs(pt1.y - pt2.y);

		$scope.drawCanvasSelectionArea(top, left, height, width);
	};

	$scope.onMapMouseMove = function(mousePos) {

		var latLon = $scope.mapLatLonFromCanvasXY(mousePos.x, mousePos.y);
		
		// !!
		// TODO = info string
		//
		// $scope.updateInfoString($scope.genLocationString(latLon.lat, latLon.lon));

		if ($scope.selecting == true) {

			$scope.mouseLastPos = mousePos;
			$scope.drawCanvasSelectionAreaFrom2Points($scope.mouseDownPos, $scope.mouseLastPos);
		}
	};

	// MAP MOUSE MOVE
	//
	$scope.canvasElement.addEventListener('mousemove', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		$scope.onMapMouseMove(mousePos);
	}, false);

	// MAP MOUSE DOWN
	//
	$scope.canvasElement.addEventListener('mousedown', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		if (evt.buttons == 1) {
			$scope.onMapLeftClickDown(mousePos);
		}
		else if (evt.buttons == 2) {
		}

	}, false);

	// SELECTION MOUSE UP
	//
	$scope.selectionAreaElement.addEventListener('mouseup', function(evt) {

		if (evt.buttons == 1) {
			$scope.onMapLeftClickUp($scope.getMousePos(evt));
		}
		else if (evt.buttons == 2) {
			// undo last zoom
		}

	}, false);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.$on(Event.MAP_REFRESH, function(evt, data) {
		$scope.draw(data.ResetMapViewPort);
	});
}