function TrackInfosController($scope, $http, $timeout) {

	$scope.trackInfos = $scope.$parent.model.trackInfos;
	$scope.searchToken = '';
	$scope.filteredTrackInfos = [];
	$scope.selectedTrackInfo = null;

	// select -----------------------------------------

	$scope.select = function(id) {

		$scope.trackInfos.forEach(
			function(x) {
				if (x.id == id)
					$scope.selectedTrackInfo = x;
			}
		);

		$scope.$emit(Event.TRACK_SELECTED, id);
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

		httpGet($http, 'trackinfos', null, successFn, null, errorFn)
	};

	$scope.load();
};