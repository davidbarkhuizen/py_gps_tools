function TrackListController($scope, $http, $timeout) {

	$scope.trackList = [];

	$scope.trackListSearchToken = '';
	$scope.filteredTrackList = [];
	$scope.selectedTrack = null;

	$scope.loadTrackList = function(trackList) {

		$scope.trackList.length = 0;
		for(var i in trackList){
			$scope.trackList.push(trackList[i]);
		}

		$scope.filterTrackList();
	};

	$scope.filterTrackList = function() {		

		matches = [];

		// filter to matches
		//
		for(var i in $scope.trackList) {
			if ($scope.trackList[i].name.toUpperCase().indexOf($scope.trackListSearchToken.toUpperCase()) !== -1) {
				matches.push($scope.trackList[i]);
			}
		}

		// sort matches
		//
		matches.sort(function(a, b) { return a > b; });

		// update filtered map list
		//
		$scope.filteredTrackList.length = 0;
		if (matches.length > 0) {			
			for(var i in matches) {
				$scope.filteredTrackList.push(matches[i]);
			}
		}

		// auto-select from matches
		//
		$scope.selectedTrack = null;
		if (!(($scope.filteredTrackList == undefined) || ($scope.filteredTrackList.length == 0))) {
			$scope.selectedTrack = $scope.filteredTrackList[0];
		}
	};

	$scope.getTrackList = function() {

		var headers = { "Content-Type": "charset=utf-8" };
		var request = { method: 'GET', url: "/maplist/", headers: headers };

		var successFn = function(response) { 
			$scope.loadTrackList(response.maps); 
		};
		var errorFn = function(error){
			$scope.globalDebug(error);
		};

		$http(request)
			.success(successFn)
			.error(errorFn);
	};

	$scope.selectTrack = function(trackId) {

		// reflect selection locally
		//
		for (var i in $scope.trackList) {
			if ($scope.trackList[i].id == trackId) {
				$scope.selectedTrack = $scope.trackList[i];
				break;
			}
		}

		$scope.$parent.onTrackSelected(trackId);
	};

	$scope.getTrackList();
};