function TrackInfosController($rootScope, $scope, $http, $timeout) {

	$scope.trackInfos = $scope.$parent.model.trackInfos;
	var tracks = $scope.$parent.tracks;

	$scope.searchToken = '';
	$scope.filteredTrackInfos = [];
	$scope.selectedTrackInfo = null;

	$scope.showAll = function() {
		$scope.searchToken = '';
		$scope.filter();	
	};

	$scope.trackIsLoaded = function(id) {

		var isLoaded = (tracks.countWhere(function(track) { return (track.id == id); }) > 0); 
		return isLoaded;
	};

	// select -----------------------------------------

	$scope.select = function(id) {

		$scope.trackInfos.forEach(
			function(x) {
				if (x.id == id)
					$scope.selectedTrackInfo = x;
			}
		);
		
		$scope.$emit(Command.LOAD_TRACK, id);
		tracks.length = 0;
	};

	// filter -----------------------------------------

	$scope.filter = function() {	

		var matchFunction = function(x) {
			return (x.name.toUpperCase().indexOf($scope.searchToken.toUpperCase()) !== -1);
		}
		var matches = $scope.trackInfos.filter(matchFunction);
		
		matches.sort(function(a, b) { return a > b; });

		// update filtered map list
		//
		$scope.filteredTrackInfos.length = 0;
		matches.forEach(function(x) {$scope.filteredTrackInfos.push(x); });
	};

	// load -------------------------------------------

	$scope.load = function() {

		var successFn = function(data) { 
			
			$scope.trackInfos.length = 0;
			data.trackInfos.forEach(function(x) { $scope.trackInfos.push(x); });

			$scope.filter();
		};
		var errorFn = function(error){
			$scope.globalDebug(error);
		};

		httpGET($http, 'trackinfos', null, successFn, null, errorFn)
	};

	// TODO - MOVE TO GOD CONTROLLER - SHOULD FIRE AS PART OF GLOBAL INIT SEQUENCE VIA CMD
	$scope.load();

	$scope.loadTrack = function(id) {
		tracks.length = 0;
		$rootScope.$emit(Command.LOAD_TRACK, id);		
	};

	$scope.addTrack = function(id) {
		$rootScope.$emit(Command.LOAD_TRACK, id);
	};
};