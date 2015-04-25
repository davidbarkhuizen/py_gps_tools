function Gfx(canvasId) {

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

	this.draw = function(tracks) {

		var getWindowDims = function() {

			that.windowWidth = document.getElementById(canvasId).parentNode.parentNode.clientWidth;
			that.windowHeight = document.getElementById(canvasId).parentNode.parentNode.clientHeight;
		};

		var sizeCanvas = function() {

			// calc canvas dims
			//
			that.width = that.windowWidth * 0.98;
			that.height = that.windowHeight * 0.98;

			// set canvas dims
			//
			that.context.canvas.width  = that.width;
			that.context.canvas.height = that.height;	
		};

		var initViewPort = function() {

			that.viewPortHeight = that.height * 1.0;
			that.viewPortWidth = that.width * 1.0;

			that.vpHalfHeight = that.height / 2.0;
			that.vpHalfWidth  = that.width / 2.0;

			that.vpAR = that.viewPortWidth / that.viewPortHeight;
		};

		// pick scale based on aspect ratios
		//
		var determineScaleFromAspectRatios = function() {

			that.minMaxLat = { 'max' : -180.0, 'min' : 180.0 };
			that.minMaxLon = { 'max' : -180.0, 'min' : 180.0 };
			that.minMaxEle = { 'max' : -10000.0, 'min' : 10000.0 };

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

				// ele
				//
				if (track.minMaxEle.max >= that.minMaxEle.max) {
					that.minMaxEle.max = track.minMaxEle.max;
				}
				if (track.minMaxEle.min <= that.minMaxEle.min) {
					 that.minMaxEle.min = track.minMaxEle.min;
				}
			}

			that.latDiff = that.minMaxLat.max - that.minMaxLat.min;
			that.lonDiff = that.minMaxLon.max - that.minMaxLon.min;
			that.eleDiff = that.minMaxEle.max - that.minMaxEle.min;

			that.midLat = (that.minMaxLat.max + that.minMaxLat.min) / 2.0;
			that.midLon = (that.minMaxLon.max + that.minMaxLon.min) / 2.0;
			that.midEle = (that.minMaxEle.max + that.minMaxEle.min) / 2.0;

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

		var toRgbString = function(r, g, b) {
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		};

		var transformPoint = function(lat, lon, ele, name) {

			// translate to center around origin
			var centeredLat = lat - that.midLat;
			var centeredLon = lon - that.midLon;

			// scale
			var scaledX = centeredLon * that.scale;
			var scaledY = centeredLat * that.scale;

			// translate to viewpoint center
			var x = that.vpHalfWidth + scaledX;
			var y = that.vpHalfHeight - scaledY;

			// COLOR
			var k = Math.floor(255.0 * (ele - that.minMaxEle.min) / that.eleDiff);
			var rgbString = toRgbString(k, 255 - k, 0);

			d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

			if (name) {
				d['name'] = name;				
			}

			return d;
		};

		var renderTrackPointsToCanvasSpace = function() {

			that.canvasPoints = [];

			for (var t in tracks) {
				for (var s in tracks[t].segments) {
					for (var p in tracks[t].segments[s].points) {

						var point = tracks[t].segments[s].points[p];
						var canvasPoint = transformPoint(point.lat, point.lon, point.ele);
						that.canvasPoints.push(canvasPoint);
					}
				}
			}
		};

		var renderWayPointsToCanvasSpace = function() {

			that.canvasWaypoints = [];

			for (var t in tracks) {
				for (var wp in tracks[t].waypoints) {

					var point = tracks[t].waypoints[wp];
					var canvasWaypoint = transformPoint(point.lat, point.lon, point.ele, point.name);

					that.canvasWaypoints.push(canvasWaypoint);
				}
			}
		};

		var blankCanvas = function() {

			that.context.fillStyle = '#FFFFFF'; // white
			that.context.fillRect(0, 0, that.viewPortWidth, that.viewPortHeight);
		};

		var drawElevationHalo = function(thickness) {

			that.context.beginPath();
		    
			var offSet = Math.floor(thickness / 2.0);

		    for (var i in that.canvasPoints) {	
		    	var pt = that.canvasPoints[i];
				that.context.fillStyle = pt.rgb;	
				that.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);	
		    };	   

		    that.context.stroke();
		};

		// var colorString = '#000000'; 
		var drawTrail = function(colorString, thickness) {		

			that.context.beginPath();
			that.context.fillStyle = colorString;

			var offSet = Math.floor(thickness / 2.0);

		    for (var i in that.canvasPoints) {	
		    	var pt = that.canvasPoints[i];
					that.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);
		    };	    

		    that.context.stroke();
		};

		var drawWaypoints = function(colorString, fontString) {

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

			var hideOverlappingPoints = true;

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

			    	that.context.moveTo(pt.x - 5, pt.y - 5);
			    	that.context.beginPath();
					that.context.fillRect(pt.x - 5, pt.y - 5, 10, 10);
					that.context.stroke();
					
					that.context.fillText(pt.name, pt.x - 5, pt.y - 10);	
				}	
		    };	   	
    
		};

		getWindowDims();
		sizeCanvas(0.90);
		initViewPort();
		determineScaleFromAspectRatios();

		renderTrackPointsToCanvasSpace();
		renderWayPointsToCanvasSpace();
		
		blankCanvas();
		
		drawElevationHalo(5);
		drawTrail('#000000', 2);
		drawWaypoints('#000000', '15px helvetica');
	};
}