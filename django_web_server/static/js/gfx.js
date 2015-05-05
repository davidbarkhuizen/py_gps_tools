function Gfx(canvasId, updateInfoString) {

	this.mapViewPort = {
		minMaxLat : { 'max' : -180.0, 'min' : 180.0 },
		minMaxLon : { 'max' : -180.0, 'min' : 180.0 }
	};

	this.useMapViewPort = false;

	var that = this;

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
				that.minMaxLat = that.mapViewPort.minMaxLat;
				that.minMaxLon = that.mapViewPort.minMaxLon;
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

		this.toRgbString = function(r, g, b) {
			return 'rgb(' + r + ',' + g + ',' + b + ')';
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
			var rgbString = this.toRgbString(k, 255 - k, 0);

			d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

			if (name) {
				d['name'] = name;				
			}

			return d;
		};

		this.renderTrackPointsToCanvasSpace = function() {

			that.canvasPoints = [];

			for (var t in tracks) {
				for (var s in tracks[t].segments) {
					for (var p in tracks[t].segments[s].points) {

						var point = tracks[t].segments[s].points[p];
						var canvasPoint = this.transformPoint(point.lat, point.lon, point.ele);
						that.canvasPoints.push(canvasPoint);
					}
				}
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

		    for (var i in that.canvasPoints) {	
		    	var pt = that.canvasPoints[i];
				that.context.fillStyle = pt.rgb;	
				that.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);	
		    };	   

		    that.context.stroke();
		};

		this.drawTrailPoint = function(x, y, offset) {
			that.context.fillRect(x - offset, y - offset, offset*2, offset*2);
		};

		// var colorString = '#000000'; 
		this.drawTrail = function(colorString, thickness) {

			that.context.beginPath();
			that.context.fillStyle = colorString;

			var offSet = Math.floor(thickness / 2.0);

		    for (var i in that.canvasPoints) {	
		    	var pt = that.canvasPoints[i];
		    	this.drawTrailPoint(pt.x, pt.y, thickness);
		    };	    

		    that.context.stroke();
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
		
		this.drawElevationHalo(5);
		this.drawTrail('#000000', 1.0);
		this.drawWaypoints('#000000', '15px courier');
	};

	this.recoverXY = function(x, y) {

		var xlon = ((x - that.vpHalfWidth) / that.scale) + that.midLon;
		var ylat = ((that.vpHalfHeight - y) / that.scale) + that.midLat;

		var s = 'lat ' + ylat.toFixed(6).toString() + ', lon ' + xlon.toFixed(6).toString();
		updateInfoString(s);

		return {
			x : xlon,
			y : ylat
		};
	};

	this.clearMapSelectionOutline = function() {

		var baseStyle = 'position: absolute; z-index: 20; border-color:black;border-width:1px;border-style:dotted;';
		var selectionAreaDiv = document.getElementById('CanvasSelectionArea');
		selectionAreaDiv.setAttribute('style', baseStyle);
	};


	// EVENT HANDLERS

	this.getMousePos = function(evt) {
		var rect = that.canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	};

	this.canvas.addEventListener('mousemove', function(evt) {

		var mousePos = that.getMousePos(evt);

		// get lat, lon
		//
		that.recoverXY(mousePos.x, mousePos.y);

		if (that.selecting == true) {

			that.moving = true;

			that.mouseLastPos = that.getMousePos(evt);

			var selectionAreaDiv = document.getElementById('CanvasSelectionArea');

			var baseStyle = 'position: absolute; z-index: 20; border-color:orange;border-width:2px;border-style:dashed;';
			var style  = baseStyle + 'left:' + Math.min(that.mouseDownPos.x, that.mouseLastPos.x) + 'px;';
			style = style + 'top:' + Math.min(that.mouseDownPos.y, that.mouseLastPos.y) + 'px;';
			style = style + 'width:' + Math.abs(that.mouseDownPos.x - that.mouseLastPos.x) + 'px;';
			style = style + 'height:' + Math.abs(that.mouseDownPos.y - that.mouseLastPos.y) + 'px;';
			selectionAreaDiv.setAttribute('style', style);
		}

	}, false);

	/*
	this.canvas.addEventListener('mouseenter', function(evt) {

		console.log('mouseenter');
		//console.log('down @ ' + mousePos);
	}, false);

	this.canvas.addEventListener('mouseout', function(evt) {

		console.log('mouseout');
		//console.log('down @ ' + mousePos);
	}, false);

	this.canvas.addEventListener('mouseleave', function(evt) {

		console.log('mouseleave');
		//console.log('down @ ' + mousePos);
	}, false);

	this.canvas.addEventListener('mousedown', function(evt) {

		that.selecting = true;
		that.mouseDownPos = that.getMousePos(evt);

		//console.log('down @ ' + mousePos);
	}, false);
	*/
	
	var selectionAreaDiv = document.getElementById('CanvasSelectionArea');

	selectionAreaDiv.addEventListener('mouseup', function(evt) {

		that.selecting = false;

		that.clearMapSelectionOutline();

		that.mouseUpPos = that.mouseLastPos;

		var xyDown = that.recoverXY(that.mouseDownPos.x, that.mouseDownPos.y);
		var xyUp = that.recoverXY(that.mouseUpPos.x, that.mouseUpPos.y);

		that.mapViewPort.minMaxLat = { 'max' : Math.max(xyDown.y, xyUp.y), 'min' : Math.min(xyDown.y, xyUp.y) };
		that.mapViewPort.minMaxLon = { 'max' : Math.max(xyDown.x, xyUp.x), 'min' : Math.min(xyDown.x, xyUp.x) };
		
		that.useMapViewPort = true;
		that.draw(that.tracks);
	}, false);
}