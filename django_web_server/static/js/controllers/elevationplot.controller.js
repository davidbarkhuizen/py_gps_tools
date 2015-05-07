function ElevationPlotController($scope, $http, $timeout) {

	$scope.canvasId = $scope.$parent.elevationPlotCanvasId;
	
	$scope.context = undefined;

	$scope.refreshContext = function() {
		
		$scope.context = (($scope.context == undefined) || ($scope.context == null))
			?  document.getElementById($scope.canvasId).getContext("2d")
			: $scope.context;					
	};

	$scope.resizeCanvasFromGrandParentNodeDims = function() {

		var canvasGrandParentNode = document
			.getElementById($scope.canvasId)
			.parentNode
			.parentNode; 
		
		var width = canvasGrandParentNode.clientWidth;
		var height = canvasGrandParentNode.clientHeight;

		$scope.context.canvas.width  = width;
		$scope.context.canvas.height = height;
	
		return [width, height];
	};

	$scope.getCanvasDimensions = function() {

		return [$scope.context.canvas.width, $scope.context.canvas.height];
	};

	$scope.clearElePlot = function(fillStyle) {

		fillStyle = (fillStyle == undefined) ? '#FFFFFF' : fillStyle;
		$scope.context.fillStyle = fillStyle;	

		[width, height] = $scope.getCanvasDimensions();	
		
		$scope.context.fillRect(0, 0, width, height);
	};

	$scope.drawElevationPlot = function() {

		[width, height] = $scope.getCanvasDimensions();

		var track = $scope.$parent.tracks[0];
		var context = $scope.context;

		var minEle = track.minMaxEle.min;
		var maxEle = track.minMaxEle.max;

		var yCanvas = function(elevation) {
			return (maxEle - elevation) / (maxEle - minEle) * (height);
		};

		var totalDistM = track.totalDistanceM;

		var xCanvas = function(distance) {
			return distance / totalDistM * width;
		};

		context.lineWidth = 2;
		context.strokeStyle = 'black';

		context.beginPath();

		for (var s in track.segments) {
			var segment = track.segments[s];

			var start = segment.points[0];
			var startY = yCanvas(start.ele);
			var startX = xCanvas(start.cumulativeDistanceM);

			context.moveTo(startX, startY);	

			for (var p = 1; p < segment.points.length; p++) {
				var point = segment.points[p];

				var y = yCanvas(point.ele);
				var x = xCanvas(point.cumulativeDistanceM);

				context.lineTo(x, y);
			}

			context.stroke();
		}
	};

	$scope.$on(Events.PLOT_ELEVATION, function(evt) {

		$scope.refreshContext();
		$scope.resizeCanvasFromGrandParentNodeDims();
		$scope.clearElePlot();		
		$scope.drawElevationPlot();
	});
};