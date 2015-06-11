var TrackColours = Object.freeze([

	Colour.BLACK, 
	Colour.BLUE, 
	Colour.PURPLE, 
	Colour.DARKGREEN, 
	Colour.RED
]);

function TracksController($rootScope, $scope, $http, $timeout) {

	$scope.getTracks = function(track) {

		var tracks = [];

		$scope.$parent.model.gpxs.forEach(function(gpx) {
			tracks = tracks.concat(gpx.tracks);
		});

		return tracks;
	};

	$scope.otherGpxsForTrack = function(track) {

		var otherGpxs = [];

		$scope.$parent.model.gpxs.forEach(function(gpx) {
			if (gpx.tracks.indexOf(track) == -1) {
				otherGpxs.push(gpx);
			}
		});

		return otherGpxs;
	};

	$scope.getUnusedTrackColour = function() {

		var inUse = $scope.getTracks()
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
	};

 	// DELETE

	$scope.deleteTrack = function (track) {

		$rootScope.$emit(Command.DELETE_TRACK, track);
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
};