function GpxController($rootScope, $scope, $http, $timeout) {

	$scope.loadGpx = function(id) {

		/*
		var matches = $scope.$parent.tracks
			.filter(function(track){return (track.id == id);});
		
		if (matches.length > 0)
			return;
		*/

		var successFn = function(data) {

			if (data.tracks.length > 0) {
				$rootScope.$emit(Command.LOAD_TRACKS, data.tracks);
			}

			if (data.waypoints.length > 0) {
				$rootScope.$emit(Command.LOAD_WAYPOINTS, data.waypoints);
			}
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