var TrackColours = Object.freeze([
	Colour.BLACK, 
	Colour.BLUE, 
	Colour.PURPLE, 
	Colour.DARKGREEN, 
	Colour.RED
]);

function TracksController($scope, $http, $timeout) {

	$scope.getUnusedTrackColour = function() {

		var inUse = $scope.$parent.tracks
			.map(function(x) { return x.colour; });

		var unUsed = TrackColours
			.filter(function(x) { return inUse.indexOf(x) == -1; });

		return (unUsed.length > 0) ? unUsed[0] : [Colour.BLACK];
	};

	$scope.load = function(id, overlay) {

		overlay = (overlay !== undefined) ? overlay : false;

		var matches = $scope.$parent.tracks
			.filter(function(track){return (track.id == id);});
		
		if (matches.length > 0)
			return;

		var successFn = function(data) { 

			if (!overlay) $scope.$parent.tracks.length = 0;

			console.log(data);

			var newTrack = new Track(data.track);
			newTrack.colour = $scope.getUnusedTrackColour();
			$scope.$parent.tracks.push(newTrack);

			$scope.$emit(Event.TRACK_LOADED);
		};

		var failFn = function(status){
			console.log('fail');
		};

		httpGet($http, 'track', id, successFn, failFn, $scope.globalDebug);
	};
	
	$scope.unload = function (id) {

		console.log(id);

		var toRetain = $scope.$parent.tracks
			.filter(function(track) { return (track.id !== id); });

		$scope.$parent.tracks.length = 0;
		
		toRetain
			.forEach(function (track) { $scope.$parent.tracks.push(track); });

		$scope.$emit(Event.TRACK_UNLOADED);
	};

	$scope.$on(Command.LOAD_TRACK, function(evt, data) {
		$scope.load(data.id, data.overlay);
	});
};