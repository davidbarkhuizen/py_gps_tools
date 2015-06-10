function GpxDatabaseController($rootScope, $scope, $http, $timeout) {

	$scope.dateValToTimeString = dateValToTimeString;

	$scope.gpxs = $scope.$parent.model.gpxs;	

	$scope.gpxinfos = $scope.$parent.model.gpxinfos;
	$scope.selectedGpxinfo = null;

	$scope.selectGpx = function(id) {

		if ((id == null) || (id === undefined))
			return;

		$scope.gpxinfos.forEach(function(info) {
			if (info.id == id)
				$scope.selectedGpxinfo = info;
		});
	};

	// -------------------------------------------------
	// GRID

	var loadIconSrcRef = '/static/img/icon/purple_button/button_plus_violet_20.png';
	var loadIconImgTemplate = '<img ng-src="' + loadIconSrcRef + '">';
	var loadCellTemplate = '<div style="padding-top:5px;"><a href="#" ng-click="grid.appScope.loadGpx(row.entity.id)" ">' + loadIconImgTemplate + '</a></div>';
	var blankHeaderTemplate = '';

	$scope.gridOptions = {      

        data: $scope.$parent.model.gpxinfos,  
        
        //showGridFooter: true,
        
        enableGridMenu: false,

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		enableFiltering: true,

        columnDefs: [
        	{ 	
        		name: '',
				field: 'id', 
				width: '80', 
				cellTemplate: loadCellTemplate,
				headerCellTemplate: '<br/>load',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
			},
			{ 	
				enableSorting: true,
				enableFiltering: false,
				name:'time', 
				field: 'time', 
				width: '150', 
				cellTooltip: true,
				// cellTooltip: function(row) { return row.entity.file_name; } 
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
				headerTooltip: 'Custom header string',
				cellTooltip: function(row) { return row.entity.name; } 
			},			
			{ 
				enableSorting: true,
				enableFiltering: false,
				name:'trk', 
				field: 'track_count', 
				headerTooltip:  'track count',
				width: '60',
				cellTooltip: function(row) { 
					
					var concatted = row.entity.track_names_concat;

					if ((concatted === undefined) || (concatted == null) || (concatted == ''))
						return 'no tracks'; 
					else
						return concatted.replace('|', '\r\n');
				}
			},		
			{ 
				enableSorting: true,
				enableFiltering: false,
				name:'wpt', 
				field: 'waypoint_count', 
				headerTooltip:  'waypoint count',
				width: '60' 
			},
        ],

		onRegisterApi: function(gridApi) {

			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				if ((row === undefined) || (row.entity.id == null) || (row.entity.id === undefined))
					return;

				$scope.selectGpx(row.entity.id);
			});
	    },
	};

	// -------------------------------------------------

	$scope.gpxIsLoaded = function(id) {

		var isLoaded = ($scope.gpxs.countWhere(function(x) { return (x.id == id); }) > 0); 
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
		if ($scope.gpxIsLoaded(id) == true)
			return;

		$rootScope.$emit(Command.LOAD_GPX, id);		
	};

	// ----------------------------------------------

	// INIT
	//
	$scope.loadGpxinfos();
};