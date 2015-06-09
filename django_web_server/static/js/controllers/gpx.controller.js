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

			var gpx = new GPX(data.xml, data.file_name);
			gpx.id = data.id;

			model.gpxs.push(gpx);

			// tracks
			//
			if (gpx.tracks.length > 0) {
				$rootScope.$emit(Command.LOAD_TRACKS, gpx.tracks);
			}

			// waypoints
			//
			if (gpx.waypoints.length > 0) {
				$rootScope.$emit(Command.LOAD_WAYPOINTS, gpx.waypoints);
			}

			// change view
			//
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

 	// UPDATE_WAYPOINT_NAME
 	//
	$scope.updateWaypointName = function(waypoint, name) {
		$scope.$parent.gpxEditor.updateWaypointName(waypoint, name);
		$rootScope.$emit(Event.WAYPOINT_EDITED);
	};
	$rootScope.$on(Command.UPDATE_WAYPOINT_NAME, function(evt, data) {
		$scope.updateWaypointName(data.waypoint, data.name);
	});

	// DELETE_WAYPOINT
	//
	$scope.deleteWaypoint = function(waypoint) {		
		$scope.$parent.gpxEditor.deleteWaypoint(waypoint);
		$rootScope.$emit(Event.WAYPOINT_DELETED, waypoint);
	};
	$rootScope.$on(Command.DELETE_WAYPOINT, function(evt, waypoint) {
		$scope.deleteWaypoint(waypoint);
	});

	// DELETE_TRACK
	//
	$scope.deleteTrack = function(track) {		
		$scope.$parent.gpxEditor.deleteTrack(track);
		$rootScope.$emit(Event.TRACK_DELETED, track);
	};
	$rootScope.$on(Command.DELETE_TRACK, function(evt, track) {
		$scope.deleteTrack(track);
	});
}