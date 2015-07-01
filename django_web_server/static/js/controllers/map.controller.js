function MapController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	$scope.model = model;

	// ---------------------------------------------
	// OPTIONS

	$scope.PlotTypes = Object.freeze({
		ELEVATION : 'elevation',
		PATH : 'path',
		POINTS : 'points'
	});

	$scope.PathSelectionTypes = PathSelectionType;
	$scope.Corners = Corner;

	$scope.getDefaultMapOptions = function() {
		return {
			titleLocation: Corner.TOP_LEFT,
			scaleBarLocation : Corner.BOTTOM_RIGHT,
			plotType : $scope.PlotTypes.PATH,
			showWaypoints : 'true',
			showCompass : 'true',

			pathSelectionType : $scope.PathSelectionTypes.BETWEEN,

			font : 'courier new',
			fontSizePx : 20,
			fontColour : Colour.BLACK	
		};
	};
	$scope.mapOptions = $scope.getDefaultMapOptions();

	$scope.onOptionChange = function(e) {
		$scope.drawMap();
	};

	// ---------------------------------------------
	// ELEMENTS

	$scope.canvasId = 'MapCanvas';
	$scope.canvas = document.getElementById($scope.canvasId);
	$scope.context = $scope.canvas.getContext("2d");

	$scope.selectionAreaDivId = 'MapSelectionArea';
	$scope.selectionArea = document.getElementById($scope.selectionAreaDivId);

	$scope.contextMenuId = 'MapContextMenu';
	$scope.contextMenu = document.getElementById($scope.contextMenuId);

	$scope.optionsMenuId = 'MapOptionsMenu';
	$scope.optionsMenu = document.getElementById($scope.optionsMenuId);

	$scope.exportCanvasId = 'ExportMapCanvas';
	$scope.exportCanvas = document.getElementById($scope.exportCanvasId);
	$scope.exportContext = $scope.exportCanvas.getContext("2d");

	$scope.editTrackMenuId = 'MapEditTrackMenu';
	$scope.editTrackMenu = document.getElementById($scope.editTrackMenuId);

	// -----------------------------------------------------------

	var filteredWaypoints = $scope.$parent.model.filteredWaypoints; 

	$scope.canvasWaypoints = [];
	$scope.latLonViewPorts = [];

	// -----------------------------------------------------------
	// CONTEXT MENU

	$scope.showContextMenu = function() {
		var state = ($scope.haveSelection() || ($scope.canZoomOut()));
		if (state == false)
			ngHide($scope.contextMenu);
		return state;
	};

	// -----------------------------------------------------------
	// SELECTION

	$scope.canvasSelections = [];

	$scope.selecting = false;
	$scope.selectionPoints = [];

	$scope.showMapSelectionArea = false;

	$scope.selectedSegmentTrack = null;
	$scope.selectedSegment = null;
	$scope.selectedSegmentSectionPoints = [];
	$scope.selectedSegmentSectionStart = null;
	$scope.selectedSegmentSectionEnd = null;

	$scope.haveSelection = function() {
		return ($scope.canvasSelections.length == 2);
	};

	$scope.cancelSelection = function() {
		
		$scope.selecting = false;
		$scope.selectionPoints[0] = undefined;
		$scope.selectionPoints[1] = undefined;
		$scope.showMapSelectionArea = false;

		$scope.closeEditTrackMenu();
	};

	$scope.cancelEditTrackSelection = function() {	

		$scope.selectedSegmentTrack = null;
		$scope.selectedSegment = null;
		$scope.selectedSegmentSectionPoints.length = 0;
		$scope.selectedSegmentSectionStart = null;
		$scope.selectedSegmentSectionEnd = null;

		$scope.cancelSelection();
	};

	$scope.getAreaSelection = function() {

		var latLon1 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[0].x, $scope.selectionPoints[0].y);
		var latLon2 = $scope.mapLatLonFromCanvasXY($scope.selectionPoints[1].x, $scope.selectionPoints[1].y);

		var minMaxLat = { 'max' : Math.max(latLon1.lat, latLon2.lat), 'min' : Math.min(latLon1.lat, latLon2.lat) };
		var minMaxLon = { 'max' : Math.max(latLon1.lon, latLon2.lon), 'min' : Math.min(latLon1.lon, latLon2.lon) };
	
		return {
			topLeft : { lat : minMaxLat.min, lon : minMaxLon.min},
			bottomRight : { lat : minMaxLat.max, lon : minMaxLon.max}
		};
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

	$scope.mapLatLonFromCanvasXY = function(x, y, domain, range, scale) {

		domain = (domain === undefined) ? $scope.domain : domain;
		range = (range === undefined) ? $scope.range : range;
		scale = (scale === undefined) ? $scope.scale : scale; 

		var lon = ((x - range.halfWidth) / scale) + domain.midLon;
		var lat = ((range.halfHeight - y) / scale) + domain.midLat;

		return { 'lon' : lon, 'lat' : lat };
	};

	$scope.genLocationText = function(lat, lon) {
		return 'lat ' + lat.toFixed(6).toString() + ', lon ' + lon.toFixed(6).toString();
	};

	// ----------------------------------------------------------
	// EDIT TRACK

	$scope.showEditTrackMenu = false;

	$scope.cancelEditTrack = function() {
		$scope.selectedSegmentTrack = null;
		$scope.selectedSegment = null;
		$scope.selectedSegmentSectionPoints.length = 0;
		$scope.selectedSegmentSectionStart = null;
		$scope.selectedSegmentSectionEnd = null;

		$scope.closeEditTrackMenu();
		$scope.drawMap();
	};

	$scope.openEditTrackMenu = function() {

		$scope.closeOptionsMenu();

		var style = $scope.getPositionStyleComponentForRightMenu();			
		$scope.editTrackMenu.setAttribute('style', style);

		ngShow($scope.editTrackMenu);
		$scope.showEditTrackMenu = true;		
		$scope.canvas.style.opacity = '0.5';
	};

	$scope.closeEditTrackMenu = function() {

		ngHide($scope.editTrackMenu);
		$scope.showEditTrackMenu = false;		
		$scope.canvas.style.opacity = '1';
	};

	$scope.onPathSelectionTypeChange = function() {
		$scope.editTrack_AreaSelected();
	};

	$scope.deleteSelectedSegmentSectionPoints = function() {

		var data = {

			pathSelectionType:  $scope.mapOptions.pathSelectionType,
			endPoints:  [
				$scope.selectedSegmentSectionStart, 
				$scope.selectedSegmentSectionEnd
			],
		};

		$scope.cancelEditTrackSelection();
		$rootScope.$emit(Command.DELETE_TRKSEG_SECTION, data);
	};

	$scope.editTrack_AreaSelected = function() {

		var slx = $scope.getAreaSelection();

		// determine which points fall inside the selection rectangle

		var isInside = function(pt) {

			var yes = 
				(
				((pt.lat >= slx.topLeft.lat) && (pt.lat <= slx.bottomRight.lat))
				&& 
				((pt.lon >= slx.topLeft.lon) && (pt.lon <= slx.bottomRight.lon))
				);

			return yes;
		};

		$scope.selectedSegmentTrack = null;
		$scope.selectedSegment = null;

		var matches = [];

		model.tracks.forEach(function(track){

			if (matches.length > 0)
					return;

			track.segments.forEach(function(segment) {

				if (matches.length > 0)
					return;

				var segmentMatches = [];

				segment.points.forEach(function(point) {
					if (isInside(point)) {
						segmentMatches.push(point);
					}
				});

				if (segmentMatches.length > 0) {
					segmentMatches.forEach(function(pt) { matches.push(pt); })

					$scope.selectedSegment = segment;
				}				
			});

			if (matches.length > 0)
				$scope.selectedSegmentTrack = track;
		});

		matches.sort(function(a, b){

			if (a.time < b.time)
				return - 1;
			else if (a.time > b.time)
				return 1;
			else
				return 0;
		});

		$scope.selectedSegmentSectionStart = matches[0];
		$scope.selectedSegmentSectionEnd = matches[matches.length - 1];

		var minTime = $scope.selectedSegmentSectionStart.time;
		var maxTime = $scope.selectedSegmentSectionEnd.time;

		$scope.selectedSegmentSectionPoints.length = 0;

		$scope.selectedSegment.points.forEach(function(p) {

			var included = false;
			switch ($scope.mapOptions.pathSelectionType) {
				case $scope.PathSelectionTypes.BETWEEN:
					included = ((p.time >= minTime) && (p.time <= maxTime));
					break;
				case $scope.PathSelectionTypes.BEFORE:
					included = (p.time < minTime);
					break;
				case $scope.PathSelectionTypes.AFTER:
					included = (p.time > maxTime);
					break;
			}

			if (included == true)
				$scope.selectedSegmentSectionPoints.push(p);
		});

		$scope.drawMap();

		$scope.openEditTrackMenu();
	};

	// ----------------------------------------------------------
	// SHARED ACROSS RIGHT MENU

	$scope.getPositionStyleComponentForRightMenu = function() {

		var width = 300;

		var style  = '';
		style = style + 'top:' + (10) + 'px;';
		style = style + 'left:' + ($scope.range.width - 10 - width) + 'px;'
		style = style + 'width:' + (width) + 'px;';

		return style;
	};

	// ----------------------------------------------------------
	// OPTIONS MENU

	$scope.showOptionsMenu = false;
	$scope.openOptionsMenu = function() {

		$scope.closeEditTrackMenu();

		var style = $scope.getPositionStyleComponentForRightMenu();			
		$scope.optionsMenu.setAttribute('style', style);
	
		ngShow($scope.optionsMenu);
		$scope.showOptionsMenu = true;
		$scope.canvas.style.opacity = '0.5';
	};

	$scope.closeOptionsMenu = function() {

		ngHide($scope.optionsMenu);
		$scope.showOptionsMenu = false;		
		$scope.canvas.style.opacity = '1';
	};

	$scope.toggleOptionsMenu = function() {

		if ($scope.showOptionsMenu == true)
			$scope.closeOptionsMenu();
		else
			$scope.openOptionsMenu();
	};

	// ----------------------------------------------------------
	// CONTEXT MENU

	$scope.openContextMenu = function() {

		var left = 10;
		var width = 100;

		var height = 15;
		var top = $scope.range.height - height;
		
		var style  = 'left:' + left + 'px;';
		style = style + 'top:' + top + 'px;';

		$scope.contextMenu.setAttribute('style', style);
		ngShow($scope.contextMenu); 
	};

	$scope.resizeCanvasSelectionArea = function() {

		if ($scope.selectionPoints.length !== 2)
			return;
		if (($scope.selectionPoints[0] === undefined) || ($scope.selectionPoints[1] === undefined))
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

	// -----------------------------------------------------------
	// document event handlers

	$scope.onLeftClickDown = function(mouseCanvasPos) {		

		$scope.selectionPoints.length = 0;
		$scope.selectionPoints.push(mouseCanvasPos);
		$scope.selectionPoints.push(mouseCanvasPos);

		$scope.resizeCanvasSelectionArea();

		$scope.selecting = true;

		$scope.showMapSelectionArea = true;
		$scope.$apply();

		$rootScope.$emit(Event.MAP_SELECTION_BEGUN);
	};

	$scope.onLeftClickUp = function(mousePos) {

		$scope.selectionPoints[1] = mousePos;
		$scope.resizeCanvasSelectionArea();

		$scope.selecting = false;

		$scope.openContextMenu();
	};	

	$scope.onMouseMove = function(mousePos) {

		if (
			((mousePos.x < 0) || (mousePos.x > $scope.range.width))
			||
			((mousePos.y < 0) || (mousePos.y > $scope.range.height))
			)
			return;

		var latLon = $scope.mapLatLonFromCanvasXY(mousePos.x, mousePos.y);
		
		var locationText = $scope.genLocationText(latLon.lat, latLon.lon);

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

	$scope.selectionArea.addEventListener('mousemove', function(evt) {
		var mousePos = $scope.getMousePos(evt);
		$scope.onMouseMove(mousePos);
	}, false);

	// MAP CLICK

	$scope.onCanvasMouseDown = function(evt) {

		var mousePos = $scope.getMousePos(evt);
		if (evt.buttons == 1) {
			$scope.onLeftClickDown(mousePos);
		}
		else if (evt.buttons == 2) {
			$scope.toggleOptionsMenu();
		}
	};

	$scope.canvas.addEventListener('mousedown', $scope.onCanvasMouseDown, false);
	$scope.selectionArea.addEventListener('mousedown', $scope.onCanvasMouseDown, false);

	// SELECTION MOUSE UP
	
	$scope.onMouseUp = function(evt) {

		if (evt.buttons == 1) {
			$scope.onLeftClickUp($scope.getMousePos(evt));
		}
		else if (evt.buttons == 2) {
			// undo last zoom
		}
	};

	$scope.canvas.addEventListener('mouseup', $scope.onMouseUp, false);
	$scope.selectionArea.addEventListener('mouseup', $scope.onMouseUp, false);

	// -----------------------------------------------------------
	// WAYPOINT SELECTION	

	$scope.areaSelectWaypoints = function() {

		if ($scope.selectionPoints.length !== 2) {
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

		$rootScope.$emit(Command.GOTO_VIEW, Views.LOADED_WAYPOINTS);
	};

	// -----------------------------------------------------------
	// RENDER

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

		var tracks = model.getTracks();

		var latLonViewPorts = $scope.latLonViewPorts;

		var domain = {};

		domain.minMaxEle = { 'max' : -10000.0, 'min' : 10000.0 };

		tracks.forEach(function(track) {
			
			if (track.minMaxEle.max >= domain.minMaxEle.max)
				domain.minMaxEle.max = track.minMaxEle.max;

			if (track.minMaxEle.min <= domain.minMaxEle.min)
				 domain.minMaxEle.min = track.minMaxEle.min;
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

		var tracks = model.getTracks();

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

	$scope.renderWaypointsToCanvasSpace = function(domain, range, scale) {		

		$scope.canvasWaypoints.length = 0;

		var waypoints = model.getWaypoints();

		waypoints.forEach(function(point) {
			var canvasWaypoint = $scope.transformPoint(domain, range, scale, point.lat, point.lon, point.ele, point.name);
			$scope.canvasWaypoints.push(canvasWaypoint);
		});
	};

	// -----------------------------------------------------------
	// DRAW

	$scope.sizeCanvas = function(context, width, height) {

		context.canvas.width  = width;
		context.canvas.height = height;	
	};

	$scope.blankCanvas = function(context, range) {

		context.fillStyle = '#FFFFFF'; // white
		context.fillRect(0, 0, range.width, range.height);
	};

	$scope.drawElevationHalo = function(thickness) {

		thickness = (thickness === undefined) ? '5' : thickness;

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
				$scope.context.fillStyle = tracks[t].colour;;	
				$scope.context.fillRect(pt.x - r, pt.y - r, 2*r + 1, 2*r + 1);
	    	}
	    }    

	    $scope.context.stroke();
	};

	$scope.drawEdges = function(context, points, thickness, color) {

		if (points.length === 0)
			return;
		
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

		var tracks = model.getTracks();

		for (var t in $scope.canvasPoints) {
			
			var vertices = $scope.canvasPoints[t];
			var colour = tracks[t].colour;

			$scope.drawEdges(context, vertices, thickness, colour);
	    }    
	};

	$scope.drawselectedSegmentSectionPoints = function(context, domain, range, scale) {

		var transformed = [];
		$scope.selectedSegmentSectionPoints.forEach(function(p){
			transformed.push($scope.transformPoint(domain, range, scale, p.lat, p.lon, p.ele));
		});

		$scope.drawEdges(context, transformed, 2, Colour.ORANGE);
	};

	$scope.drawWaypoint = function(context, cx, cy, size, color, text, font, fontSize) {

		if (color) {
			context.fillStyle = color;
			context.strokeStyle = color;
		}

		// empty circle
		//
		context.beginPath();
		context.arc(cx, cy, 1, 0, Math.PI*2, true);
		context.arc(cx, cy, 2, 0, Math.PI*2, true);
		context.arc(cx, cy, 3, 0, Math.PI*2, true);
		context.arc(cx, cy, 4, 0, Math.PI*2, true);
		context.stroke();
		context.beginPath();
		context.arc(cx, cy, 10, 0, Math.PI*2, true);
		context.stroke();
	
		// text
		//
		if (text !== undefined) {
			text = text.toUpperCase();

			context.textAlign = 'left';
			context.font = fontSize + 'px ' + ' bold ' + font;
			context.textBaseline = 'middle';
			context.fillText(text, cx + 15, cy);
		}	
	}

	$scope.drawTitleText = function(context, range, text, corner, colour, font, fontSize) {

		var offset = 10;

		corner = (corner === undefined) ? $scope.mapOptions.titleLocation : corner;
		colour = (colour === undefined) ? $scope.mapOptions.fontColour : colour;
		font = (font === undefined) ? $scope.mapOptions.font : font;
		fontSize = (fontSize === undefined) ? $scope.mapOptions.fontSizePx: fontSize;

		text = text.toUpperCase();

		context.textBaseline = 'top';

		context.fillStyle = colour;
		context.font = 'bold ' + fontSize + 'px ' + font;

		var textWidth = context.measureText(text).width;

		var ulOffset = 0;

		context.beginPath();
		context.strokeStyle = colour;
		context.lineWidth = 1;
		
		// top left
		if (corner == Corner.TOP_LEFT) {
			
			context.textAlign = 'left';
			context.fillText(text, offset, offset);
		
			context.moveTo(offset, offset + fontSize + ulOffset);
			context.lineTo(offset + textWidth, offset + fontSize + ulOffset);
		}
		
		if (corner == Corner.TOP_RIGHT) {
			
			context.textAlign = 'right';
			context.fillText(text, range.width - offset, offset);
		
			context.moveTo(range.width - offset, offset + fontSize + ulOffset);
			context.lineTo(range.width - (offset + textWidth), offset + fontSize + ulOffset);
		}

		if (corner == Corner.BOTTOM_LEFT) {
			
			context.textAlign = 'left';
			context.textBaseline = 'bottom';
			context.fillText(text, offset, range.height - offset);

			context.moveTo(offset, (range.height - offset) + ulOffset);
			context.lineTo(offset + textWidth, (range.height - offset) + ulOffset);
		}

		if (corner == Corner.BOTTOM_RIGHT) {	
			context.textAlign = 'right';
			context.textBaseline = 'bottom';
			context.fillText(text, range.width - offset, range.height - offset);
		
			context.moveTo(range.width - offset, (range.height - offset) + ulOffset);
			context.lineTo((range.width - offset) - textWidth, (range.height - offset) + ulOffset);
		}

		context.stroke();
	};

	$scope.drawScaleBar = function(context, domain, range, scale, corner) {

		corner = (corner === undefined) ? Corner.BOTTOM_RIGHT : corner;

		// DETERMINE WHICH REFERENCE LENGTH IS APPROPRIATE

		var referencesM = [ 
			5, 
			10,
			20, 
			25, 
			50, 
			100, 
			200, 
			250, 
			500, 
			1000,
			5000,
			10000 
		];

		var tl = { lat : domain.minMaxLat.min, lon : domain.minMaxLon.min };
		var br = { lat : domain.minMaxLat.max, lon : domain.minMaxLon.max };

		var lonDiffM = haversineDistanceMetres(tl.lat, tl.lon, tl.lat, br.lon);
		var latDiffM = haversineDistanceMetres(tl.lat, tl.lon, br.lat, tl.lon);
		
		var diffM = Math.max(lonDiffM, latDiffM);
		var guess = Math.round(diffM / 4);
		
		var refs = referencesM.filter(function(x) { return x <= guess; });

		if (refs.length == 0)
			return;

		var ref = refs[refs.length - 1];

		// GOAL-SEEK CORRECT CANVAS LENGTH

		var edgeOffset = 20;

		var startX, startY;

		switch (corner) {
			case Corner.BOTTOM_RIGHT:
				startX = range.width - edgeOffset;
				startY = range.height - edgeOffset;
				break;
			case Corner.TOP_RIGHT:
				startX = range.width - edgeOffset;
				startY = edgeOffset;
				break;
			case Corner.TOP_LEFT:
				startX = edgeOffset;
				startY = edgeOffset;
				break;
			case Corner.BOTTOM_LEFT:
				startX = edgeOffset;
				startY = range.height - edgeOffset;
				break;
			default:
				throw "unknown corner - " + corner;
		}

		var startLL = $scope.mapLatLonFromCanvasXY(startX, startY, domain, range, scale);

		var endY = startY;

		var distM = function(endX) {
			var endLL = $scope.mapLatLonFromCanvasXY(endX, endY, domain, range, scale);
			return haversineDistanceMetres(startLL.lat, startLL.lon, endLL.lat, endLL.lon);
		}

		var endX = binarySearch(distM, ref, edgeOffset, range.width - edgeOffset, 20);

		// DRAW

		context.lineWidth = 1;		
		context.strokeStyle = Colour.BLACK;
		context.beginPath();

		context.moveTo(startX, startY);			
	   	context.lineTo(endX, endY);
	    context.stroke();

	    // DRAW TEXT

	    var fontSize = 15;
	    var font = $scope.defaultFont;

		context.fillStyle = $scope.mapOptions.fontColour;
		context.font = fontSize + 'px ' + font;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText(ref + ' m', (startX + endX) / 2, startY + (edgeOffset / 2) + 5);

		context.fill();
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

	    var dy = range.height / 2; // r * Math.sin(Math.PI / 2 - theta);
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

		    $scope.drawWaypoint(context, x, y, size, color, name, font, fontSize);

		    // TODO should draw marker large enough to contain all viewpoint   	
		}
	};

	$scope.draw = function(context, width, height, discard) {

		console.log('draw');

		var tracks = model.getTracks();

		var domain = $scope.measureDomain();
		var range = $scope.measureRange(width, height);

		console.dir('tracks ', tracks);
		console.dir('domain ', domain);
		console.dir('range ', range);

		var scale = null;
		// too tall, use y to scale
		if (domain.aspectRatio <= range.aspectRatio)
			scale = range.height / domain.latDiff;
		// too wide, use x to scale
		else			
			scale = range.width / domain.lonDiff;

		// RENDER

		$scope.renderTrackPointsToCanvasSpace(domain, range, scale);
		$scope.renderWaypointsToCanvasSpace(domain, range, scale);

		// DRAW

		$scope.sizeCanvas(context, range.width, range.height);

		$scope.blankCanvas(context, range);

		var lineThickness = 2;

		// COMPASS
		//
		if ($scope.mapOptions.showCompass == 'true') {
			$scope.drawCompass(context, range, 0);
		}

		// SCALE
		//
		$scope.drawScaleBar(context, domain, range, scale, $scope.mapOptions.scaleBarLocation);

		// PLOT TYPE
		
		if ($scope.mapOptions.plotType == $scope.PlotTypes.PATH) {
			$scope.drawAllTracksEdgesColoured(context, lineThickness);
		}
		else if ($scope.mapOptions.plotType == $scope.PlotTypes.POINTS) {
			$scope.drawTrackVertices('#000000', 1.0);
		}
		else if ($scope.mapOptions.plotType == $scope.PlotTypes.ELEVATION) {
			$scope.drawElevationHalo();
		}

		if ($scope.selectedSegmentSectionPoints.length > 0) {
			$scope.drawselectedSegmentSectionPoints(context, domain, range, scale);
		}
			
		// WAYPOINTS
		//
		if ($scope.mapOptions.showWaypoints == 'true') {
			$scope.drawWaypoints(context, $scope.canvasWaypoints, 10, Colour.BLACK, $scope.mapOptions.font, 15);
		}

		// PLOT TITLE
		//
		var titleText = tracks.length > 0 ? tracks[0].name : 'no tracks';
		if (tracks.length > 1)
			titleText = titleText + ' + ' + (tracks.length - 1);

		// context, range, text, corner, colour, font, defaultFontSizePx
		$scope.drawTitleText(context, range, titleText, $scope.mapOptions.titleLocation);

		// DISCARD OR SAVE STATE

		if (discard == true) {
			// nop, discard
		} else {
			$scope.domain = domain;
			$scope.range = range;
			$scope.scale = scale;
		}
	};

	$scope.drawMap = function() {

		console.log('map - redraw');
		
		// TODO - fix ref to parent
		var dims = $scope.$parent.getWindowDimensions();	
		$scope.draw($scope.context, dims.width, dims.height);  
	};

	// RE-DRAW TRIGGERS
	//
	$scope.redrawTriggers = [
		Event.TRACK_LOADED,
		Event.TRACKS_UNLOADED,
		Event.WAYPOINTS_LOADED,
		Event.WAYPOINTS_UNLOADED,
		Event.WAYPOINT_EDITED,
		Event.WAYPOINT_DELETED,
		Event.GPX_EDITED,
		Event.GPXS_UNLOADED,
		];

	// register
	//
	$scope.redrawTriggers.forEach(function(trigger) {	
		$rootScope.$on(trigger, $scope.drawMap);		
	});

	// -----------------------------------------------------------
	// EXPORT

	$rootScope.$on(Command.EXPORT_MAP, function(evt) {

		// A-series paper proportions
		var width = 1189, height = 841;
		
		$scope.draw($scope.exportContext, width, height, true);
		
		var fileName = tracks[0].name.replace(' ', '') + '.png';
		var data = { canvas : $scope.exportCanvas, fileName : fileName };	
		
		$rootScope.$emit(Command.EXPORT_CANVAS, data);
	});	
}