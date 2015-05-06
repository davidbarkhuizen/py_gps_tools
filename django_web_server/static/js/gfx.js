function Gfx(canvasId, updateInfoString) {

	this.canvasId = canvasId;
	this.canvasSelectionAreaDivId = 'CanvasSelectionArea';

	var that = this;
	that.updateInfoString = updateInfoString;

	that.plotType = PlotType.EDGES;

	// MAP VIEW PORT

	this.mapCanvasSelections = [];
	this.mapViewPorts = [];

	this.mapViewPort = function() {
		return that.mapViewPorts[that.mapViewPorts.length - 1];
	};

	this.useMapViewPort = false;

	this.cancelSelection = function() {
		that.clearMapSelectionOutline();
		that.selecting = false;
		that.mouseDownPos = null;
		that.mouseUpPos = null;		
	};

	// ZOOM IN/OUT ---------------------------------

	this.zoomIn = function() {

		if ((that.mouseDownPos == undefined) || (that.mouseUpPos == undefined))
			return;

		var latLonDown = that.mapLatLonFromCanvasXY(that.mouseDownPos.x, that.mouseDownPos.y);
		var latLonUp = that.mapLatLonFromCanvasXY(that.mouseUpPos.x, that.mouseUpPos.y);

		var minMaxLat = { 'max' : Math.max(latLonDown.lat, latLonUp.lat), 'min' : Math.min(latLonDown.lat, latLonUp.lat) };
		var minMaxLon = { 'max' : Math.max(latLonDown.lon, latLonUp.lon), 'min' : Math.min(latLonDown.lon, latLonUp.lon) };
		
		var mapViewPort = { 'lat' : minMaxLat, 'lon' : minMaxLon };

		that.mapViewPorts.push(mapViewPort);
		that.mapCanvasSelections.push([that.mouseDownPos, that.mouseUpPos]);

		that.useMapViewPort = true;

		that.draw(that.tracks);		

		that.clearMapSelectionOutline();
		that.mouseDownPos = undefined;
		that.mouseUpPos = undefined;
	};

	this.zoomOut = function() {

		if (that.mapViewPorts.length == 0)
			return;

		that.clearMapSelectionOutline();
		
		that.mapViewPorts.pop();		
		var canvasSelection = that.mapCanvasSelections.pop();

		if (that.mapViewPorts.length > 0)
			that.draw(that.tracks);
		else
			that.draw(that.tracks, true);

		if (canvasSelection != null) {
			that.drawCanvasSelectionAreaFrom2Points(that.canvasSelectionAreaDivId, canvasSelection[0], canvasSelection[1]);		
			that.mouseDownPos = canvasSelection[0];
			that.mouseUpPos = canvasSelection[1];
		}
	};

	var constructContext = function() {
		
		that.canvas = document.getElementById(canvasId);

		if (that.canvas.getContext) {
			that.context = that.canvas.getContext("2d");
		}
	};

	var init = function() {
		constructContext();
	};

	init();

	// ----------------

	this.draw = function(tracks, resetMapViewPort) {

		that.tracks = tracks;

		if (resetMapViewPort == true) {
			that.useMapViewPort = false;
			that.cancelSelection();
		}

		this.getWindowDims = function() {

			that.windowWidth = document.getElementById(canvasId).parentNode.parentNode.clientWidth;
			that.windowHeight = document.getElementById(canvasId).parentNode.parentNode.clientHeight;
		};

		this.sizeCanvas = function() {

			// calc canvas dims
			//
			that.width = that.windowWidth * 0.98;
			that.height = that.windowHeight * 0.98;

			// set canvas dims
			//
			that.context.canvas.width  = that.width;
			that.context.canvas.height = that.height;	
		};

		this.initViewPort = function() {

			that.viewPortHeight = that.height * 1.0;
			that.viewPortWidth = that.width * 1.0;

			that.vpHalfHeight = that.height / 2.0;
			that.vpHalfWidth  = that.width / 2.0;

			that.vpAR = that.viewPortWidth / that.viewPortHeight;
		};

		this.calcDimensions = function() {

			that.minMaxEle = { 'max' : -10000.0, 'min' : 10000.0 };
			for(var t in tracks) {
				var track = tracks[t];

				if (track.minMaxEle.max >= that.minMaxEle.max) {
					that.minMaxEle.max = track.minMaxEle.max;
				}
				if (track.minMaxEle.min <= that.minMaxEle.min) {
					 that.minMaxEle.min = track.minMaxEle.min;
				}
			}

			if (that.useMapViewPort == true) {
				var mapViewPort = that.mapViewPort();
				that.minMaxLat = mapViewPort.lat;
				that.minMaxLon = mapViewPort.lon;
			}
			else {
				that.minMaxLat = { 'max' : -180.0, 'min' : 180.0 };
				that.minMaxLon = { 'max' : -180.0, 'min' : 180.0 };

				for(var t in tracks) {
					var track = tracks[t];

					// lat
					//
					if (track.minMaxLat.max >= that.minMaxLat.max) {
						that.minMaxLat.max = track.minMaxLat.max;
					}
					if (track.minMaxLat.min <= that.minMaxLat.min) {
						 that.minMaxLat.min = track.minMaxLat.min;
					}

					// lon
					//
					if (track.minMaxLon.max >= that.minMaxLon.max) {
						that.minMaxLon.max = track.minMaxLon.max;
					}
					if (track.minMaxLon.min <= that.minMaxLon.min) {
						 that.minMaxLon.min = track.minMaxLon.min;
					}
				}

				var latMargin = (that.minMaxLat.max - that.minMaxLat.min) * 0.05;
				var lonMargin = (that.minMaxLat.max - that.minMaxLat.min) * 0.05;

				that.minMaxLat.max = that.minMaxLat.max + latMargin;
				that.minMaxLat.min = that.minMaxLat.min - latMargin;

				that.minMaxLon.max = that.minMaxLon.max + lonMargin;
				that.minMaxLon.min = that.minMaxLon.min - lonMargin;
			}

			that.latDiff = that.minMaxLat.max - that.minMaxLat.min;
			that.lonDiff = that.minMaxLon.max - that.minMaxLon.min;
			that.eleDiff = that.minMaxEle.max - that.minMaxEle.min;

			that.midLat = (that.minMaxLat.max + that.minMaxLat.min) / 2.0;
			that.midLon = (that.minMaxLon.max + that.minMaxLon.min) / 2.0;
			that.midEle = (that.minMaxEle.max + that.minMaxEle.min) / 2.0;
		};

		// pick scale based on aspect ratios
		//
		this.determineScaleFromAspectRatios = function() {

			var ar = that.lonDiff / that.latDiff;

			if (ar <= that.vpAR) {
				// too tall, use y to scale
				that.scale = that.viewPortHeight / that.latDiff;
			}
			else {
				// too wide, use x to scale
				that.scale = that.viewPortWidth / that.lonDiff;
			}
		};

		this.transformPoint = function(lat, lon, ele, name) {

			// translate
			//
			var centeredLat = lat - that.midLat;
			var centeredLon = lon - that.midLon;

			// scale
			//
			var scaledX = centeredLon * that.scale;
			var scaledY = centeredLat * that.scale;

			// translate to viewpoint center
			//
			var x = that.vpHalfWidth + scaledX;
			var y = that.vpHalfHeight - scaledY;

			// ------------------------------------

			// colour
			//
			var k = Math.floor(255.0 * (ele - that.minMaxEle.min) / that.eleDiff);
			var rgbString = toRgbString(k, 255 - k, 0);

			d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

			if (name) {
				d['name'] = name;				
			}

			return d;
		};

		this.renderTrackPointsToCanvasSpace = function() {

			that.canvasPoints = [];

			for (var t in tracks) {

				var track = [];

				for (var s in tracks[t].segments) {
					for (var p in tracks[t].segments[s].points) {

						var point = tracks[t].segments[s].points[p];
						var canvasPoint = this.transformPoint(point.lat, point.lon, point.ele);
						track.push(canvasPoint);
					}
				}

				that.canvasPoints.push(track);
			}
		};

		this.renderWayPointsToCanvasSpace = function() {

			that.canvasWaypoints = [];

			for (var t in tracks) {
				for (var wp in tracks[t].waypoints) {

					var point = tracks[t].waypoints[wp];
					var canvasWaypoint = this.transformPoint(point.lat, point.lon, point.ele, point.name);

					that.canvasWaypoints.push(canvasWaypoint);
				}
			}
		};

		this.blankCanvas = function() {

			that.context.fillStyle = '#FFFFFF'; // white
			that.context.fillRect(0, 0, that.viewPortWidth, that.viewPortHeight);
		};

		this.drawElevationHalo = function(thickness) {

			that.context.beginPath();
		    
			var offSet = Math.floor(thickness / 2.0);

		    for (var t in that.canvasPoints) {
		    	var track = that.canvasPoints[t];
		    	for (var i in track){ 	

			    	var pt = track[i];
					that.context.fillStyle = pt.rgb;	
					that.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);	
		    	}
		    }   

		    that.context.stroke();
		};

		// draw individual points
		// 
		this.drawTrackVertices = function(colorString, r) {

			that.context.beginPath();
			that.context.fillStyle = colorString;

		    for (var t in that.canvasPoints) {
		    	var track = that.canvasPoints[t];
		    	for (var i in track){ 	

			    	var pt = track[i];
					that.context.fillStyle = pt.rgb;	
					that.context.fillRect(pt.x - r, pt.y - r, 2*r + 1, 2*r + 1);
		    	}
		    }    

		    that.context.stroke();
		};

		this.drawEdges = function(points, thickness, color) {
			
			// style
			//
			that.context.lineWidth = thickness;
			that.context.strokeStyle = color;

			that.context.beginPath();
			var start = points[0];
			that.context.moveTo(start.x, start.y);			

		    for (var i = 1; i < points.length; i++) {	
		    	var pt = points[i];
		    	that.context.lineTo(pt.x, pt.y);
		    };

		    that.context.stroke();		        
		};
		
		// draw continuous trail
		// 
		this.drawAllTracksEdgesColoured = function(thickness) {    

			for (var t in that.canvasPoints) {
				
				var vertices = that.canvasPoints[t];
				var color = that.tracks[t].color;

				that.drawEdges(vertices, thickness, color);
		    }    
		};

		this.drawWaypoints = function(colorString, fontString) {

			that.context.fillStyle = colorString;
			that.context.font = fontString;

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

		    for (var i in that.canvasWaypoints) {	
		    	
		    	var pt = that.canvasWaypoints[i];		    	

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
			    	that.context.moveTo(pt.x - z, pt.y - z);
			    	that.context.beginPath();
					that.context.fillRect(pt.x - z, pt.y - z, 2*z, 2*z);
					that.context.stroke();		
					
					/*
					that.context.fillRect(pt.x, pt.y, 1, 1);
					that.context.beginPath();
					that.context.arc(pt.x, pt.y,5,0,Math.PI*2,true);
					that.context.stroke();
					*/

					that.context.fillText(pt.name, pt.x - 5, pt.y - 10);	
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

		var lon = ((x - that.vpHalfWidth) / that.scale) + that.midLon;
		var lat = ((that.vpHalfHeight - y) / that.scale) + that.midLat;

		return { 'lon' : lon, 'lat' : lat };
	};

	this.clearMapSelectionOutline = function() {

		var baseStyle = 'position: absolute; z-index: 20; border-color:black;border-width:1px;border-style:dotted;';
		var selectionAreaDiv = document.getElementById('CanvasSelectionArea');
		selectionAreaDiv.setAttribute('style', baseStyle);
	};

	// EVENT HANDLERS ========================================================

	this.getMousePos = function(evt) {
		var rect = that.canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};

	this.onMapLeftClickDown = function(mouseCanvasPos) {

		that.selecting = true;
		that.mouseDownPos = mouseCanvasPos;
	};

	this.onMapLeftClickUp = function() {

		that.selecting = false;
		that.mouseUpPos = that.mouseLastPos;
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

		that.drawCanvasSelectionArea(id, top, left, height, width);
	};

	this.onMapMouseMove = function(mousePos) {

		var latLon = that.mapLatLonFromCanvasXY(mousePos.x, mousePos.y);
		that.updateInfoString(that.genLocationString(latLon.lat, latLon.lon));

		if (that.selecting == true) {

			that.mouseLastPos = mousePos;
			that.drawCanvasSelectionAreaFrom2Points(that.canvasSelectionAreaDivId, that.mouseDownPos, that.mouseLastPos);
		}
	};

	// MAP MOUSE MOVE
	//
	this.canvas.addEventListener('mousemove', function(evt) {
		var mousePos = that.getMousePos(evt);
		that.onMapMouseMove(mousePos);
	}, false);

	// MAP MOUSE DOWN
	//
	this.canvas.addEventListener('mousedown', function(evt) {
		var mousePos = that.getMousePos(evt);
		if (evt.buttons == 1) {
			that.onMapLeftClickDown(mousePos);
		}
		else if (evt.buttons == 2) {
		}

	}, false);

	var selectionAreaDiv = document.getElementById('CanvasSelectionArea');

	// SELECTION MOUSE UP
	//
	selectionAreaDiv.addEventListener('mouseup', function(evt) {

		if (evt.buttons == 1) {
			that.onMapLeftClickUp(that.getMousePos(evt));
		}
		else if (evt.buttons == 2) {
			// undo last zoom
		}

	}, false);
}