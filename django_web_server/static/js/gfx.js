function Gfx(canvasId) {

	var that = this;

	var getWindowDims = function() {

		that.windowWidth = window.innerWidth; // window.screen.availWidth; // window.innerWidth;
		that.windowHeight = window.innerHeight; // window.screen.availHeight; //  window.innerHeight;
	};

	var constructContext = function() {
		
		that.canvas = document.getElementById(canvasId);

		that.context = undefined;
		if (that.canvas.getContext) {
			that.context = that.canvas.getContext("2d");
		}
	};

	var sizeCanvas = function() {
		// calc canvas dims
		//
		that.width = that.windowWidth * 0.95;
		that.height = that.windowHeight * 0.90;

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

	var init = function() {
		getWindowDims();
		constructContext();
		sizeCanvas();
		initViewPort();
	};

	init();

	// ----------------

	this.draw = function(track) {

		// pick scale based on aspect ratios
		//
		var determineScaleFromAspectRatios = function() {

			that.scale = undefined;
			if (track.latlonAR <= that.vpAR) {
				// too tall, use y to scale
				that.scale = that.viewPortHeight / track.latDiff;
			}
			else {
				// too wide, use x to scale
				that.scale = that.viewPortWidth / track.lonDiff;
			}
		};

		var toRgbString = function(r, g, b) {
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		};

		var transformPoint = function(lat, lon, ele, name) {

			// translate to center around origin
			var centeredLat = lat - track.midLat;
			var centeredLon = lon - track.midLon;

			// scale
			var scaledX = centeredLon * that.scale;
			var scaledY = centeredLat * that.scale;

			// translate to viewpoint center
			var x = that.vpHalfWidth + scaledX;
			var y = that.vpHalfHeight - scaledY;

			// COLOR
			var k = Math.floor(255.0 * (ele - track.minMaxEle.min) / track.eleDiff);
			var rgbString = toRgbString(k, 255 - k, 0);

			d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

			if (name) {
				d['name'] = name;				
			}

			return d;
		};

		var renderTrackPointsToCanvasSpace = function() {

			that.canvasPoints = [];

			for (var s in track.segments) {
				for (var p in track.segments[s].points) {

					var point = track.segments[s].points[p];
					var canvasPoint = transformPoint(point.lat, point.lon, point.ele);
					that.canvasPoints.push(canvasPoint);
				}
			}
		};

		var renderWayPointsToCanvasSpace = function() {

			that.canvasWaypoints = [];

			for (var wp in track.waypoints) {

				var point = track.waypoints[wp];
				var canvasWaypoint = transformPoint(point.lat, point.lon, point.ele, point.name);
				that.canvasWaypoints.push(canvasWaypoint);
			}

		};

		var blankCanvas = function() {

			that.context.fillStyle = '#FFFFFF'; // white
			that.context.fillRect(0, 0, that.viewPortWidth, that.	viewPortHeight);
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

		determineScaleFromAspectRatios();
		renderTrackPointsToCanvasSpace();
		renderWayPointsToCanvasSpace();
		blankCanvas();
		drawElevationHalo(5);
		drawTrail('#000000', 2);
		drawWaypoints('#000000', '15px helvetica');
	};
}

/*
Gfx.prototype.draw = function(track) {

	var that = this;

	// pick scale based on aspect ratios
	//
	var determineScaleFromAspectRatios = function() {

		that.scale = undefined;
		if (that.track.latlonAR <= that.vpAR) {
			// too tall, use y to scale
			scale = viewPortHeight / track.latDiff;
		}
		else {
			// too wide, use x to scale
			scale = viewPortWidth / track.lonDiff;
		}
	};

	var toRgbString = function(r, g, b) {
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	};

	var transformPoint = function(lat, lon, ele, name) {

		// translate to center around origin
		var centeredLat = lat - track.midLat;
		var centeredLon = lon - track.midLon;

		// scale
		var scaledX = centeredLon * that.scale;
		var scaledY = centeredLat * that.scale;

		// translate to viewpoint center
		var x = that.vpHalfWidth + scaledX;
		var y = that.vpHalfHeight - scaledY;

		// COLOR
		var k = Math.floor(255.0 * (ele - track.minMaxEle.min) / track.eleDiff);
		var rgbString = toRgbString(k, 255 - k, 0);

		d =  { 'x' : x, 'y' : y, 'rgb' : rgbString };

		if (name) {
			d['name'] = name;				
		}

		return d;
	};

	var renderTrackPointsToCanvasSpace = function() {

		that.canvasPoints = [];

		for (var s in track.segments) {
			for (var p in track.segments[s].points) {

				var point = track.segments[s].points[p];
				var canvasPoint = transformPoint(point.lat, point.lon, point.ele);
				that.canvasPoints.push(canvasPoint);
			}
		}
	};

	var renderWayPointsToCanvasSpace = function() {

		that.canvasWaypoints = [];

		for (var wp in track.waypoints) {

			var point = track.waypoints[wp];
			var canvasWaypoint = transformPoint(point.lat, point.lon, point.ele, point.name);
			that.canvasWaypoints.push(canvasWaypoint);
		}

	};

	var blankCanvas = function() {

		$scope.context.fillStyle = '#FFFFFF'; // white
		$scope.context.fillRect(0, 0, viewPortWidth, viewPortHeight);
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

		$scope.context.beginPath();
		$scope.context.fillStyle = colorString;

		var offSet = Math.floor(thickness / 2.0);

	    for (var i in $scope.canvasPoints) {	
	    	var pt = $scope.canvasPoints[i];
				$scope.context.fillRect(pt.x - offSet, pt.y - offSet, thickness, thickness);
	    };	    

	    $scope.context.stroke();
	};

	var drawWaypoints = function(colorString, fontString) {

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

	determineScaleFromAspectRatios();
	renderTrackPointsToCanvasSpace();
	renderWayPointsToCanvasSpace();
	blankCanvas();
	drawElevationHalo(5);
	drawTrail('#000000', 2);
	drawWaypoints('#000000', '15px helvetica');

	return true;
};
*/