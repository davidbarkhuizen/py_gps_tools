function GpxDatabaseController($rootScope, $scope, $http, $timeout) {

	$scope.gpxinfos = $scope.$parent.model.gpxinfos;
	var tracks = $scope.$parent.tracks;

	$scope.searchToken = '';
	$scope.filteredGpxinfos = [];
	$scope.selectedGpxinfo = null;

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

		$scope.gpxInfos.forEach(
			function(x) {
				if (x.id == id)
					$scope.selectedGpxinfo = x;
			}
		);
		
		//$rootScope.$emit(Command.LOAD_TRACK, id);
		tracks.length = 0;
	};

	// filter -----------------------------------------

	$scope.filter = function() {	

		var matchFunction = function(x) {

			var token = $scope.searchToken.toUpperCase();

			if ((token == null) || (token.length == 0))
				return true;
			
			var hits = [x.name, x.file_name, x.track_names_concat]
				.filter(function(z) { return z !== null})
				.map(function(z) { return z.toUpperCase(); })
				.filter(function(z) { return z.indexOf(token) !== -1})

			return (hits.length > 0);
		}
		var matches = $scope.gpxinfos.filter(matchFunction);
		
		matches.sort(function(a, b) { return a.file_name.localeCompare(b.file_name); });

		// update filtered map list
		//
		$scope.filteredGpxinfos.length = 0;
		matches.forEach(function(x) {$scope.filteredGpxinfos.push(x); });
	};

	// load -------------------------------------------

	$scope.loadGpxinfos = function() {

		var successFn = function(data) { 
			
			$scope.gpxinfos.length = 0;
			data.gpxinfos.forEach(function(x) { $scope.gpxinfos.push(x); });
			data.gpxinfos.sort(function(a, b) { 
				return a.file_name.localeCompare(b.file_name); 
			});

			$scope.filter();
		};
		var errorFn = function(error){
			$scope.globalDebug(error);
		};

		httpGET($http, 'gpxinfos', null, successFn, null, errorFn)
	};

	$rootScope.$on(Event.GPX_FILE_IMPORTED, function(evt){
		$scope.loadGpxinfos();
	});

	// ----------------------------------------------
	// UI COMMANDS

	$scope.loadGpx = function(id) {
		$rootScope.$emit(Command.LOAD_GPX, id);		
	};

	// ----------------------------------------------

	// INIT
	//
	$scope.loadGpxinfos();
};