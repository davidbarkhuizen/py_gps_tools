var TrackColours = Object.freeze([

	Colour.BLACK, 
	Colour.BLUE, 
	Colour.PURPLE, 
	Colour.DARKGREEN, 
	Colour.RED
]);

function TracksController($rootScope, $scope, $http, $timeout) {

	$scope.getUnusedTrackColour = function() {

		var inUse = $scope.$parent.tracks
			.map(function(x) { return x.colour; });

		var unUsed = TrackColours
			.filter(function(x) { return inUse.indexOf(x) == -1; });

		return (unUsed.length > 0) ? unUsed[0] : [Colour.BLACK];
	};

	// LOAD

	$scope.loadTracks = function(tracks) {

		var added = false;

		tracks.forEach(function(track){

			track.colour = $scope.getUnusedTrackColour();
			$scope.$parent.tracks.push(track);
			added = true;
		});

		if (added == true)
			$rootScope.$emit(Event.TRACKS_LOADED);
	};
	
 	$rootScope.$on(Command.LOAD_TRACKS, function(evt, tracks) {
		$scope.loadTracks(tracks);	
	});

 	// DELETE

	$scope.deleteTrack = function (track) {

		$rootScope.$emit(Command.DELETE_TRACK, track);
	};

	$scope.reloadTrack = function (id) {

		$scope.$parent.tracks.removeWhere(function(track) { return (track.id == id); });
		$rootScope.$emit(Event.TRACKS_UNLOADED);
	};

	// EXPORT

	$scope.exportTrack = function(id) {
		
		var fileName = $scope.$parent.tracks
			.first(function(track) { return (track.id == id); })
			.name + '.gpx'
		
		$rootScope.$emit(Command.EXPORT_TRACKS, { ids : [id], fileName : fileName});
	};

	$scope.exportAllTracks = function() {

		var ids = $scope.$parent.tracks.map(function(track) { return track.id; });		
		$rootScope.$emit(Command.EXPORT_TRACKS, { ids : ids });
	};

	$scope.saveTrack = function(id) {

	};
};