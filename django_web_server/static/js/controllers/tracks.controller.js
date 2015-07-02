function TracksController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model;

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
};