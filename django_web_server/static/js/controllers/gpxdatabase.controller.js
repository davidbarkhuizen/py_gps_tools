function GpxDatabaseController($rootScope, $scope, $http, $timeout) {

	$scope.gpxinfos = $scope.$parent.model.gpxinfos;
	var tracks = $scope.$parent.tracks;

	// -------------------------------------------------
	// GRID

	var loadCellTemplate = '<a href="" ng-click="grid.appScope.loadGpx(row.entity.id)">+</a>';
	var blankHeaderTemplate = '';

	$scope.gridOptions = {        
        showGridFooter: true,
        enableGridMenu: false,
        columnDefs: [
        	{ 	
        		name: '',
				field: 'id', 
				width: '50', 
				cellClass: '', 
				cellTemplate: loadCellTemplate,
				enableSorting: false, 
				enableHiding: false,
			},
			{ 	
				enableSorting: true,
				name:'file name', 
				field: 'file_name', 
				width: '400', 
				cellClass: 'grid-cell-text', 
				cellTooltip: function(row) { return row.entity.file_name; } 
			},			
			{ 
				enableSorting: true,
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
				enableSorting: true,
				name:'tracks', 
				field: 'track_count', 
				width: '100',
				cellTooltip: function(row) { 
					
					var concatted = row.entity.track_names_concat;

					if ((concatted == undefined) || (concatted == null) || (concatted == ''))
						return 'no tracks'; 
					else
						return concatted.replace('|', '\r\n');
				}
			},		
			{ 
				enableSorting: true,
				name:'waypoint', 
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