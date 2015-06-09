function GpxController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	var tracks = $scope.$parent.tracks;

	$scope.loadGpx = function(id) {

		/*
		var matches = $scope.$parent.tracks
			.filter(function(track){return (track.id == id);});
		
		if (matches.length > 0)
			return;
		*/

		var successFn = function(data) {

			var gpx = new GPX(data.xml);
			gpx.id = data.id;
			model.gpxs.push(gpx);

			// tracks

			var trackAdded = false;

			gpx.tracks.forEach(function(track){ 
				tracks.push(track); 
				trackAdded = true;
			});

			if (trackAdded == true) {
				$rootScope.$emit(Command.LOAD_TRACKS, tracks);
			}

			// waypoints

			var waypointsAdded = false;

			gpx.waypoints.forEach(function(waypoint){ 
				model.waypoints.push(waypoint); 
				waypointsAdded = true;
			});

			if (waypointsAdded == true) {
				$rootScope.$emit(Command.LOAD_WAYPOINTS, waypoints);
			}

			// change view

			$rootScope.$emit(Command.GOTO_VIEW, Views.LOADED_GPXS);
		};

		var failFn = function(status){
			console.log('fail');
		};

		httpGET($http, 'gpx', { 'id' : id }, successFn, failFn, $scope.globalDebug);
	};

 	$rootScope.$on(Command.LOAD_GPX, function(evt, id) {
		$scope.loadGpx(id);	
	});
}