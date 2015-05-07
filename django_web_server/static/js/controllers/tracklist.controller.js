function TrackListController($scope, $http, $timeout) {

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];

	$scope.loadMapList = function(mapList) {

		$scope.mapList.length = 0;
		for(var i in mapList){
			$scope.mapList.push(mapList[i]);
		}

		$scope.filterMapList();
	};

	$scope.filterMapList = function() {		

		matches = [];

		// filter to matches
		//
		for(var i in $scope.mapList) {
			if ($scope.mapList[i].name.toUpperCase().indexOf($scope.mapSearchToken.toUpperCase()) !== -1) {
				matches.push($scope.mapList[i]);
			}
		}

		// sort matches
		//
		matches.sort(function(a, b) { return a > b; });

		// update filtered map list
		//
		$scope.filteredMapList.length = 0;
		if (matches.length > 0) {			
			for(var i in matches) {
				$scope.filteredMapList.push(matches[i]);
			}
		}

		// auto-select from matches
		//
		$scope.selectedMap.length = 0;
		if (!(($scope.filteredMapList == undefined) || ($scope.filteredMapList.length == 0))) {
			$scope.selectedMap.push($scope.filteredMapList[0]);
		}
	};

	$scope.getMapList = function() {

		var headers = { "Content-Type": "charset=utf-8" };
		var request = { method: 'GET', url: "/maplist/", headers: headers };

		var successFn = function(response) { 
			$scope.loadMapList(response.maps); 
		};
		var errorFn = function(error){
			$scope.globalDebug(error);
		};

		$http(request)
			.success(successFn)
			.error(errorFn);
	};

	$scope.getMapList();
};