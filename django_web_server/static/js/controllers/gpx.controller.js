function GpxController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;

	$scope.loadGpx = function(id) {

		/*
		var matches = $scope.$parent.tracks
			.filter(function(track){return (track.id == id);});
		
		if (matches.length > 0)
			return;
		*/

		var successFn = function(data) {

			var tracks = [];
			data.tracks.forEach(function(track_dict){ 
				var track = new Track(track_dict);
				tracks.push(track); 
			});

			if (tracks.length > 0) {
				$rootScope.$emit(Command.LOAD_TRACKS, tracks);
			}

			var waypoints = [];
			data.waypoints.forEach(function(waypoint_dict){ 
				var waypoint = parseWaypointDict(waypoint_dict);
				waypoints.push(waypoint); 
			});

			if (waypoints.length > 0) {
				$rootScope.$emit(Command.LOAD_WAYPOINTS, waypoints);
			}

			var gpx = new GPX(data.name, data.desc, tracks, waypoints, data.file_name, data.xml);
			gpx.id = data.id;
			model.gpxs.push(gpx);

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