var TrackColours = Object.freeze([
	Colour.BLACK, 
	Colour.BLUE, 
	Colour.PURPLE, 
	Colour.DARKGREEN, 
	Colour.RED
]);

function TracksController($scope, $http, $timeout) {

	$scope.tracks = $scope.$parent.tracks;

	$scope.getUnusedTrackColour = function() {

		var inUse = $scope.tracks
			.map(function(x) { return x.colour; });

		var unUsed = TrackColours
			.filter(function(x) { inUse.indexOf(x) == -1; });

		return (unUsed.length !== 0) ? unUsed[0] : [Colour.BLACK];
	};

	$scope.load = function(id, overlay) {

		overlay = (overlay !== undefined) ? overlay : false;

		var matches = $scope.tracks
			.filter(function(track){return (track.id == id);});
		
		if (matches.length > 0)
			return;

		var successFn = function(data) { 

			if (!overlay) $scope.tracks.length = 0;

			var newTrack = new Track(data.track);
			newTrack.colour = $scope.getUnusedTrackColour();
			$scope.tracks.push(newTrack);

			console.log('tracks.load.successFn - tracks')
			console.log($scope.tracks);

			$scope.$emit(Event.TRACK_LOADED);

	    	$scope.mapIsLoadedAndActive = true;
	    	$scope.headerText = 'map';
	    	$scope.view = $scope.Views.MAP;  
		};

		var failFn = function(status){
			console.log('fail');
		};

		httpGet($http, 'track', id, successFn, failFn, $scope.globalDebug);
	};
	
	$scope.unload = function (id) {

		var toRetain = $scope.tracks
			.filter(function(track) { return (track.id !== id); });

		$scope.tracks.length = 0;
		
		toRetain
			.forEach(function (track) { $scope.tracks.push(track); });

		$scope.$broadcast(Event.TRACK_UNLOADED);
	};

	$scope.$on(Command.LOAD_TRACK, function(evt, id) {
		$scope.load(id);
	}); 
}