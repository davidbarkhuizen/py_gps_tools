function ElevationPlotController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model;

	$scope.canvasId = 'ElevationPlotCanvas';
	$scope.canvasElement = document.getElementById($scope.canvasId);

	$scope.context = $scope.canvasElement.getContext("2d");

	$scope.refreshContext = function() {
		
		$scope.context = (($scope.context === undefined) || ($scope.context == null))
			?  document.getElementById($scope.canvasId).getContext("2d")
			: $scope.context;					
	};

	$scope.sizeCanvas = function() {

		var dims = $scope.$parent.getWindowDimensions();

		// calc canvas dims
		//
		$scope.width = dims.width;
		$scope.height = dims.height;

		// set canvas dims
		//
		$scope.context.canvas.width  = $scope.width;
		$scope.context.canvas.height = $scope.height;	
	
		return [$scope.width, $scope.height];
	};

	$scope.getCanvasDimensions = function() {

		return [$scope.context.canvas.width, $scope.context.canvas.height];
	};

	$scope.clearElePlot = function(fillStyle) {

		fillStyle = (fillStyle === undefined) ? '#FFFFFF' : fillStyle;
		$scope.context.fillStyle = fillStyle;	

		var widthHeight = $scope.getCanvasDimensions();
		
		$scope.context.fillRect(0, 0, widthHeight[0], widthHeight[1]);
	};

	$scope.drawElevationPlot = function() {

		var tracks = $scope.model.getTracks();

		if (tracks.length == 0)
			return;

		var dims = $scope.getCanvasDimensions();
		var width = dims[0];
		var height = dims[1];

		var track = tracks[0]; // TODO all tracks to common scale
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

	$scope.redraw = function() {
		$scope.refreshContext();
		$scope.sizeCanvas();
		$scope.clearElePlot();		
		$scope.drawElevationPlot();
	};

	$rootScope.$on(Event.DATA_MODEL_CHANGED, function(evt) {
		$scope.redraw();
	});
};