function MapController($rootScope, $scope, $http, $timeout) {

	var tracks = $scope.$parent.tracks;

	var waypoints = $scope.$parent.model.waypoints; 
	var filteredWaypoints = $scope.$parent.model.filteredWaypoints; 

	$scope.canvasWaypoints = [];

	// ---------------------------------------------
	// DEFAULTS

	$scope.defaultFont = 'helvetica';
	$scope.defaultFontSizePx = 20;
	$scope.defaultFontColour = Colour.BLACK;

	$scope.defaultTitleCorner = Corner.TOP_LEFT;
	
	// ---------------------------------------------
	// ELEMENTS

	$scope.canvas = document.getElementById($scope.$parent.mapCanvasId);
	$scope.context = $scope.canvas.getContext("2d");

	$scope.latLonViewPorts = [];

	// selection area

	// -----------------------------------------------------------

	$scope.getWindowDims = function() {

		var navbar = document.getElementById('navbar');
		var fudge = navbar.parentNode.offsetHeight + 10;

		var dims = {
			height : window.innerHeight - fudge, 
			width : document.body.offsetWidth
		};

		return dims;
	};

	// -----------------------------------------------------------
	// CONTEXT MENU

	$scope.mapContextMenuElement = document
		.getElementById($scope.$parent.mapContextMenuDivId);

	$scope.ShowMapContextMenu = function() {
		return (($scope.isSelected()) || ($scope.canZoomOut()));
	};

	// -----------------------------------------------------------
	// SELECTION

	// 
	$scope.canvasSelections = [];

	$scope.selecting = false;
	$scope.selectionPoints = [];

	$scope.showMapSelectionArea = false;

	$scope.selectionArea = document
		.getElementById($scope.$parent.mapSelectionAreaDivId);

	$scope.isSelected = function() {
		return (($scope.showMapSelectionArea) && (!$scope.selecting));
	};

	$scope.cancelSelection = function() {
		
		$scope.selecting = false;
		$scope.selectionPoints.length = 0;
		$scope.showMapSelectionArea = false;

		$scope.makeMapOpaque();
	};

	// ZOOM IN/OUT ----------------------------------------------

	$scope.canZoomIn = function()  {
		return ($scope.selectionPoints.length == 2);
	};

	$scope.zoomIn = function() {

		if (!$scope.canZoomIn())
			return;

		var latLon1 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[0].x, $scope.selectionPoints[0].y);
		var latLon2 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[1].x, $scope.selectionPoints[1].y);

		var minMaxLat = { 'max' : Math.max(latLon1.lat, latLon2.lat), 'min' : Math.min(latLon1.lat, latLon2.lat) };
		var minMaxLon = { 'max' : Math.max(latLon1.lon, latLon2.lon), 'min' : Math.min(latLon1.lon, latLon2.lon) };
		
		var latLonViewPort = { 'lat' : minMaxLat, 'lon' : minMaxLon };
		$scope.latLonViewPorts.push(latLonViewPort);

		$scope.canvasSelections.push([$scope.selectionPoints[0], $scope.selectionPoints[1]]);

		$scope.cancelSelection();

		$scope.drawMap();		
	};

	$scope.canZoomOut = function() {
		return ($scope.latLonViewPorts.length > 0);
	};

	$scope.zoomOut = function() {

		if ($scope.canZoomOut() == false)
			return;

		$scope.cancelSelection();

		$scope.latLonViewPorts.pop();	
		$scope.drawMap();

		// re-draw previous selection area	
		//	
		if ($scope.canvasSelections.length > 0) {

			// console.log('redrawing selection area');

			var newSelection = $scope.canvasSelections.pop();

			$scope.selectionPoints.length = 0;
			$scope.selectionPoints.push(newSelection[0]);
			$scope.selectionPoints.push(newSelection[1]);

			$scope.resizeCanvasSelectionArea();		

			$scope.showMapSelectionArea = true;
			$scope.makeMapSemiTransparent();
		}
		else {

			$scope.selectionPoints.length = 0;
			$scope.showMapSelectionArea = false;
		}
	};

	// ----------------------------------------------------------
	// INITIAL 

	$scope.sizeCanvas = function(context, width, height) {

		context.canvas.width  = width;
		context.canvas.height = height;	
	};

	$scope.measureRange = function(width, height) {

		var range = {};

		range.width = width;
		range.height = height;			

		range.halfHeight = range.height / 2.0;
		range.halfWidth  = range.width / 2.0;

		range.aspectRatio = range.width / range.height;
	
		return range;
	};

	$scope.measureDomain = function() {

		var latLonViewPorts = $scope.latLonViewPorts;

		var domain = {};

		domain.minMaxEle = { 'max' : -10000.0, 'min' : 10000.0 };

		tracks.forEach(function(track) {
			
			if (track.minMaxEle.max >= domain.minMaxEle.max)
				domain.minMaxEle.max = track.minMaxEle.max;

			if (track.minMaxEle.min <= domain.minMaxEle.min)
				 domain.minMaxEle.min = domain.minMaxEle.min;
		});

		// use currently defined view port
		//
		if ((latLonViewPorts) && (latLonViewPorts.length > 0)) {

			var latLonViewPort = latLonViewPorts[latLonViewPorts.length - 1];
			
			domain.minMaxLat = latLonViewPort.lat;
			domain.minMaxLon = latLonViewPort.lon;
		}
		else { // recalc

			domain.minMaxLat = { 'max' : -180.0, 'min' : 180.0 };
			domain.minMaxLon = { 'max' : -180.0, 'min' : 180.0 };

			tracks.forEach(function(track){

				// lat
				//
				if (track.minMaxLat.max >= domain.minMaxLat.max) {
					domain.minMaxLat.max = track.minMaxLat.max;
				}
				if (track.minMaxLat.min <= domain.minMaxLat.min) {
					 domain.minMaxLat.min = track.minMaxLat.min;
				}

				// lon
				//
				if (track.minMaxLon.max >= domain.minMaxLon.max) {
					domain.minMaxLon.max = track.minMaxLon.max;
				}
				if (track.minMaxLon.min <= domain.minMaxLon.min) {
					 domain.minMaxLon.min = track.minMaxLon.min;
				}
			});

			// APPLY MARGIN %

			var latMarginPercent = 5;
			var lonMarginPercent = 5;

			var latMargin = (domain.minMaxLat.max - domain.minMaxLat.min) * latMarginPercent / 100;
			var lonMargin = (domain.minMaxLat.max - domain.minMaxLat.min) * lonMarginPercent / 100;

			domain.minMaxLat.max = domain.minMaxLat.max + latMargin;
			domain.minMaxLat.min = domain.minMaxLat.min - latMargin;

			domain.minMaxLon.max = domain.minMaxLon.max + lonMargin;
			domain.minMaxLon.min = domain.minMaxLon.min - lonMargin;
		}

		domain.latDiff = domain.minMaxLat.max - domain.minMaxLat.min;
		domain.lonDiff = domain.minMaxLon.max - domain.minMaxLon.min;
		domain.eleDiff = domain.minMaxEle.max - domain.minMaxEle.min;

		domain.midLat = (domain.minMaxLat.max + domain.minMaxLat.min) / 2.0;
		domain.midLon = (domain.minMaxLon.max + domain.minMaxLon.min) / 2.0;
		domain.midEle = (domain.minMaxEle.max + domain.minMaxEle.min) / 2.0;

		domain.aspectRatio = domain.lonDiff / domain.latDiff;
	
		return domain
	};

	$scope.transformPoint = function(domain, range, scale, lat, lon, ele, name) {

		// translate
		//
		var centeredLat = lat - domain.midLat;
		var centeredLon = lon - domain.midLon;

		// scale
		//
		var scaledX = centeredLon * scale;
		var scaledY = centeredLat * scale;

		// translate to viewpoint center
		//
		var x = range.halfWidth + scaledX;
		var y = range.halfHeight - scaledY;

		// ------------------------------------

		// colour
		//
		var k = Math.floor(255.0 * (ele - domain.minMaxEle.min) / domain.eleDiff);
		var rgbString = toRgbString(k, 255 - k, 0);

		d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

		if (name) {
			d['name'] = name;				
		}

		return d;
	};

	$scope.renderTrackPointsToCanvasSpace = function(domain, range, scale) {

		$scope.canvasPoints = [];

		for (var t in tracks) {

			var track = [];

			for (var s in tracks[t].segments) {
				for (var p in tracks[t].segments[s].points) {

					var point = tracks[t].segments[s].points[p];
					var canvasPoint = $scope.transformPoint(domain, range, scale, point.lat, point.lon, point.ele);
					track.push(canvasPoint);
				}
			}

			$scope.canvasPoints.push(track);
		}
	};

	$scope.renderWayPointsToCanvasSpace = function(domain, range, scale) {		

		$scope.canvasWaypoints.length = 0;

		waypoints.forEach(function(point) {
			var canvasWaypoint = $scope.transformPoint(domain, range, scale, point.lat, point.lon, point.ele, point.name);
			$scope.canvasWaypoints.push(canvasWaypoint);
		});
	};

	$scope.blankCanvas = function(context, range) {

		context.fillStyle = '#FFFFFF'; // white
		context.fillRect(0, 0, range.width, range.height);
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

	$scope.drawEdges = function(context, points, thickness, color) {
		
		// style
		//
		context.lineWidth = thickness;
		context.strokeStyle = color;

		context.beginPath();
		var start = points[0];
		context.moveTo(start.x, start.y);			

	    for (var i = 1; i < points.length; i++) {	
	    	var pt = points[i];
	    	context.lineTo(pt.x, pt.y);
	    };

	    context.stroke();		        
	};
	
	$scope.drawAllTracksEdgesColoured = function(context, thickness) {    

		for (var t in $scope.canvasPoints) {
			
			var vertices = $scope.canvasPoints[t];
			var colour = tracks[t].colour;

			$scope.drawEdges(context, vertices, thickness, colour);
	    }    
	};

	$scope.drawWayPoint = function(context, cx, cy, size, color, name, font, fontSize) {

		if (color) {
			context.fillStyle = color;
			context.strokeStyle = color;
		}

		// empty square
		//
		z = Math.floor(size / 2);		
    	context.beginPath();
		context.strokeRect(cx - z, cy - z, 2*z, 2*z);
		context.stroke();		

		// with center dot
		//
    	context.beginPath();
		context.fillRect(cx, cy, 1, 1);
		context.stroke();		

		/*
		// empty circle
		//
		context.beginPath();
		context.arc(pt.x, pt.y,5,0,Math.PI*2,true);
		context.stroke();
		*/

		// text
		//
		if (name !== undefined) {
			context.font = fontSize + 'px ' + font;
			context.textBaseline = 'middle';
			context.fillText(name, cx + size, cy);
		}	
	}

	$scope.drawTitleText = function(context, range, text, corner, colour, font, fontSize) {

		corner = (corner == undefined) ? $scope.defaultTitleCorner : corner;
		colour = (colour == undefined) ? $scope.defaultFontColour : colour;
		font = (font == undefined) ? $scope.defaultFont : font;
		fontSize = (fontSize == undefined) ? $scope.defaultFontSizePx: fontSize;

		context.fillStyle = colour;
		context.font = 'bold ' + fontSize + 'px ' + font;

		// top left
		if (corner == Corner.TOP_LEFT) {
			
			context.textAlign = 'left';
			context.fillText(text, fontSize, fontSize);
		}
		
		if (corner == Corner.TOP_RIGHT) {
			
			context.textAlign = 'right';
			context.fillText(text, range.width - fontSize, fontSize);
		}

		if (corner == Corner.BOTTOM_LEFT) {
			
			context.textAlign = 'left';
			context.textBaseline = 'bottom';
			context.fillText(text, fontSize, range.height - fontSize);
		}

		if (corner == Corner.BOTTOM_RIGHT) {	
			context.textAlign = 'right';
			context.textBaseline = 'bottom';
			context.fillText(text, range.width - fontSize, range.height - fontSize);
		}
	};

	$scope.drawCompass = function(context, range, magneticDeclinationDegrees) {

		var cx = range.width / 2;
		var cy = range.height / 2;

		context.lineWidth = 1;		
		context.strokeStyle = Colour.LIGHTGREY;

		// true north line

		context.beginPath();

		context.moveTo(cx, 0);			
	   	context.lineTo(cx, range.height);
	    context.stroke();

	    // magnetic north line

	    var theta = magneticDeclinationDegrees.toRad();

	    var dy = $scope.height / 2; // r * Math.sin(Math.PI / 2 - theta);
	    var r = dy * Math.sin(Math.PI / 2 - theta);

	    var dx = r * Math.cos(Math.PI / 2 - theta);

		context.beginPath();

		context.moveTo(cx + dx, cy - dy);			
	   	context.lineTo(cx - dx, cy + dy);

	    context.stroke();
	};

	$scope.drawWaypoints = function(context, canvasWaypoints, size, color, font, fontSize) {

		var clusterFn = function(wp1, wp2) {

			var dist = Math.sqrt(
				(wp1.x - wp2.x) * (wp1.x - wp2.x)
				+
				(wp1.y - wp2.y) * (wp1.y - wp2.y)
				);

			var result = (dist <= (2*size));

			return result;
		};

		var clusters = clusterPoints(canvasWaypoints, clusterFn);

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
			else if (cluster.length > 1) { // cluster of waypoints too dense to display

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

		    $scope.drawWayPoint(context, x, y, size, color, name, font, fontSize);

		    // TODO should draw marker large enough to contain all viewpoint   	
		}
	};

	$scope.draw = function(context, width, height, discard) {

		var domain = $scope.measureDomain();
		var range = $scope.measureRange(width, height);

		var scale = null;
		// too tall, use y to scale
		if (domain.aspectRatio <= range.aspectRatio)
			scale = range.height / domain.latDiff;
		// too wide, use x to scale
		else			
			scale = range.width / domain.lonDiff;

		// RENDER & DRAW

		$scope.sizeCanvas(context, range.width, range.height);

		$scope.renderTrackPointsToCanvasSpace(domain, range, scale);
		$scope.renderWayPointsToCanvasSpace(domain, range, scale);

		$scope.blankCanvas(context, range);

		// $scope.drawElevationHalo();
		// $scope.drawTrackVertices('#000000', 1.0);

		var lineThickness = 2;
		$scope.drawAllTracksEdgesColoured(context, lineThickness);
		
		$scope.drawWaypoints(context, $scope.canvasWaypoints, 10, Colour.BLACK, 'helvetica', 15);

		// title
		//
		var titleText = tracks.length > 0 ? tracks[0].name : 'no tracks';
		if (tracks.length > 1)
			titleText = titleText + ' + ' + (tracks.length - 1);

		$scope.drawTitleText(context, range, titleText);

		$scope.drawCompass(context, range, 0);

		if (discard == true) {
			// nop, discard
		} else {
			$scope.domain = domain;
			$scope.range = range;
		}
	};

	$scope.mapLatLonFromCanvasXY = function(x, y) {

		var lon = ((x - $scope.vpHalfWidth) / $scope.scale) + $scope.midLon;
		var lat = (($scope.vpHalfHeight - y) / $scope.scale) + $scope.midLat;

		return { 'lon' : lon, 'lat' : lat };
	};

	$scope.genLocationText = function(lat, lon) {
		return 'lat ' + lat.toFixed(6).toString() + ', lon ' + lon.toFixed(6).toString();
	};

	$scope.showMapContextMenu = false;

	$scope.openContextMenu = function() {

		var pt1 = $scope.selectionPoints[0];
		var pt2 = $scope.selectionPoints[1];

		var left = 20;
		var width = 100;

		var height = 20;
		var top = $scope.range.height - (height + 10);
		
		var style  = 'left:' + left + 'px;';
		style = style + 'top:' + top + 'px;';

		$scope.mapContextMenuElement.setAttribute('style', style);
		$scope.mapContextMenuElement.className = $scope.mapContextMenuElement.className.replace('ng-hide', ''); 
	};

	$scope.resizeCanvasSelectionArea = function() {

		if ($scope.selectionPoints.length !== 2)
			return;
		if (($scope.selectionPoints[0] == undefined) || ($scope.selectionPoints[1] == undefined))
			return;

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

		$scope.selectionArea.setAttribute('style', style);
	};

	$scope.getMousePos = function(evt) {
		var rect = $scope.canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.makeMapOpaque = function() {
		$scope.canvas.setAttribute('style', 'opacity:1.0;');
	};	

	$scope.makeMapSemiTransparent = function(opacity) {
		opacity = (opacity == undefined) ? 0.8 : opacity;
		$scope.canvas.setAttribute('style', 'opacity:' + opacity.toFixed(1) +' ;');
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

		$scope.openContextMenu();
	};	

	$scope.onMouseMove = function(mousePos) {

		if (
			((mousePos.x < 0) || (mousePos.x > $scope.width))
			||
			((mousePos.y < 0) || (mousePos.y > $scope.height))
			)
			return;

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
	$scope.canvas.addEventListener('mousemove', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		$scope.onMouseMove(mousePos);
	}, false);

	// MAP MOUSE DOWN
	//
	$scope.canvas.addEventListener('mousedown', function(evt) {

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
	$scope.canvas.addEventListener('mouseup', function(evt) {

		if (evt.buttons == 1) {
			$scope.onLeftClickUp($scope.getMousePos(evt));
		}
		else if (evt.buttons == 2) {
			// undo last zoom
		}
	}, false);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// handlers for angular.js events

	$scope.drawMap = function() {
		var dims = $scope.getWindowDims();	
		$scope.draw($scope.context, dims.width, dims.height);  
	};

	// RE-DRAW TRIGGERS
	$scope.redrawTriggers = [
		Event.TRACK_LOADED,
		Event.TRACK_UNLOADED,
		Event.WAYPOINTS_LOADED,
		Event.WAYPOINTS_UNLOADED,
		Event.WAYPOINT_EDITED,
		Event.WAYPOINT_DELETED
		];
	// register
	$scope.redrawTriggers.forEach(function(trigger) {		
		$rootScope.$on(trigger, $scope.drawMap);		
	});

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// WAYPOINT SELECTION	

	$scope.areaSelectWayPoints = function() {

		if ($scope.selectionPoints.length !== 2) {
			console.log($scope.selectionPoints);
			throw '$scope.selectionPoints.length !== 2';
		}

		// determine selection area

		var latLon1 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[0].x, $scope.selectionPoints[0].y);
		var latLon2 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[1].x, $scope.selectionPoints[1].y);

		var minMaxLat = { 'max' : Math.max(latLon1.lat, latLon2.lat), 'min' : Math.min(latLon1.lat, latLon2.lat) };
		var minMaxLon = { 'max' : Math.max(latLon1.lon, latLon2.lon), 'min' : Math.min(latLon1.lon, latLon2.lon) };
	
		// determine which points fall inside

		var isInside = function(wpt) {

			var yes = 
				(
				(wpt.lat >= minMaxLat.min) 
				&& (wpt.lat <= minMaxLat.max)
				&& (wpt.lon >= minMaxLon.min) 
				&& (wpt.lon <= minMaxLon.max)
				);

			return yes;
		};

		var inside = [];
		waypoints.forEach(function(x) { if (isInside(x)) inside.push(x); });

		// update model: filteredWaypoints, selectedPoint

		filteredWaypoints.length = 0;
		inside.forEach(function(x){ filteredWaypoints.push(x); });
	
		if (filteredWaypoints.length)
			$scope.$parent.model.selectedPoint = filteredWaypoints[0];

		$rootScope.$emit(Command.GOTO_VIEW, $scope.$parent.Views.WAYPOINTS);
	};
}