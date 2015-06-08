function GpxDatabaseController($rootScope, $scope, $http, $timeout) {

	$scope.gpxinfos = $scope.$parent.model.gpxinfos;
	var tracks = $scope.$parent.tracks;

	// -------------------------------------------------
	// GRID

	// var textCellTemplate = '<button class="btn primary" ng-click="grid.appScope.showMe()">Click Me</button>';

	$scope.gridOptions = {
        enableSorting: true,
        columnDefs: [
			{ 	
				name:'file name', 
				field: 'file_name', 
				width: '400', 
				cellClass: 'grid-cell-text', 
				cellTooltip: function(row) { return row.entity.file_name; } 
			},			
			{ 
				name:'name', 
				field: 'name', 
				cellClass: 'grid-cell-text',
				cellTooltip: function(row) { return row.entity.name; } 
			},			
			{
				name:'desc', 
				field: 'desc', 
				cellClass: 'grid-cell-text',
				cellTooltip: function(row) { return row.entity.name; } 
			},			
			{ 
				name:'tracks', 
				field: 'track_count', 
				width: '100' 
			},		
			{ 
				name:'waypoints', 
				field: 'waypoint_count', 
				width: '140' 
			},
        ],
        data: $scope.$parent.model.gpxinfos
	};

	// -------------------------------------------------

	$scope.trackIsLoaded = function(id) {

		var isLoaded = (tracks.countWhere(function(track) { return (track.id == id); }) > 0); 
		return isLoaded;
	};

	// load -------------------------------------------

	$scope.loadGpxinfos = function() {

		var successFn = function(data) { 
			
			$scope.gpxinfos.length = 0;
			data.gpxinfos.forEach(function(x) { $scope.gpxinfos.push(x); });
			data.gpxinfos.sort(function(a, b) { 
				return a.file_name.localeCompare(b.file_name); 
			});

			$scope.gridOptions.data = $scope.$parent.model.gpxinfos;
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