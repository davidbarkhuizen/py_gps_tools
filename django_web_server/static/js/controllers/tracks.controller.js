var TrackColours = Object.freeze([

	Colour.BLACK, 
	Colour.BLUE, 
	Colour.PURPLE, 
	Colour.DARKGREEN, 
	Colour.RED
]);

function TracksController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model;

	$scope.getUnusedTrackColour = function() {

		var inUse = $scope.model.getTracks()
			.map(function(x) { return x.colour; });

		var unUsed = TrackColours
			.filter(function(x) { 
				return ((x !== undefined) && (inUse.indexOf(x) == -1)); 
			});

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

 	// COPY TRACK

	$scope.copyInfo = {
		trackToCopy: null,
		gpxIdToCopyTo: null
	};

 	$scope.setTrackToCopy = function(track) {
 		$scope.trackToCopy = track;
 	};

	$scope.copyTrackToGpx = function() {

		var data = { gpx: $scope.copyInfo.gpxToCopyTo, track: $scope.copyInfo.trackToCopy };
		$rootScope.$emit(Command.COPY_TRACK_TO_GPX, data);
		$scope.copyInfo.trackToCopy = undefined;
	};

 	// UNLOAD

	$scope.unloadTrack = function(track) {

		$rootScope.$emit(Command.UNLOAD_TRACK, track);
	};

	// EXPORT

	$scope.exportTrack = function(track) {
		
		var name = (track.name !== undefined)
			? track.name
			: 'track';

		var fileName = name + '.gpx'
	
		$rootScope.$emit(Command.EXPORT_TRACKS, { tracks : [track], fileName : fileName});
	};

	$scope.exportAllTracks = function() {

		var ids = $scope.$parent.tracks.map(function(track) { return track.id; });		
		$rootScope.$emit(Command.EXPORT_TRACKS, { ids : ids });
	};

	// MAINTENANCE ACTIVITIES IN RESPONSE TO EVENTS

	$scope.fixTracksWithNoColour = function() {

		$scope.model.getTracks().forEach(function(track){
			if (track.colour === undefined) {
				track.colour = $scope.getUnusedTrackColour();
			}
		});
	};

	$rootScope.$on(Event.GPX_EDITED, function(evt, data) {
		$scope.fixTracksWithNoColour();
	});
};