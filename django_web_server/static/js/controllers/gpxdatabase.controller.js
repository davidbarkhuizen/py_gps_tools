function GpxDatabaseController($rootScope, $scope, $http, $timeout) {

	$scope.model = $scope.$parent.model;
	$scope.dateValToTimeString = dateValToTimeString;

	$scope.selectGpxInfo = function(id) {

		if ((id == null) || (id === undefined))
			return;

		$scope.model.gpxinfos.forEach(function(info) {
			if (info.id == id)
				$scope.model.selectedGpxinfo = info;
		});
	};

	$scope.gotoGpx = function() {
		$rootScope.$emit(Command.GOTO_VIEW, Views.GPX);
	};

	// -------------------------------------------------
	// GRID

	$scope.gridApi = undefined;

	$scope.selectFirstGridRow = function() {
		$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
	}
	$scope.selectFirstGridRowDelayed = function() {
		$timeout($scope.selectFirstGridRow, 0);
	};

	var loadIconSrcRef = '/static/img/icon/black_button/button_black_plus_16.png';
	var loadAnchorTemplate = '<a href="#" title="load" ng-show="(grid.appScope.model.gpxIdIsLoaded(row.entity.id) === false)" ng-click="grid.appScope.loadGpx(row.entity.id)" "><img ng-src="|||0|||"></a>'
		.replace('|||0|||', loadIconSrcRef);

	var loadedIconSrcRef = '/static/img/icon/black_button/button_black_play_16.png';
	var loadedAnchorTemplate = '<a href="#" title="go to" ng-show="(grid.appScope.model.gpxIdIsLoaded(row.entity.id) === true)" ng-click="grid.appScope.gotoGpx(row.entity);" "><img ng-src="|||0|||"></a>'
		.replace('|||0|||', loadedIconSrcRef);

	var actionCellTemplate =  '<div style="padding-top:5px;">|||0|||</div>'
		.replace('|||0|||', loadAnchorTemplate + loadedAnchorTemplate);

	$scope.gridApi = undefined;
	$scope.gridOptions = {      

        data: $scope.model.gpxinfos,
        
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
				cellTemplate: actionCellTemplate,
				headerCellTemplate: '<span></span>',
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
				cellTooltip: function(row) { return row.entity.file_name; },
				enableFiltering: true,
				filter: { condition: basicFilter }
			},
			{ 
				enableSorting: true,
				name:'name', 
				field: 'name', 
				cellClass: 'grid-cell-text',
				cellTooltip: function(row) { return row.entity.name; },
				enableFiltering: true,
				filter: { condition: basicFilter }
			},			
			{
				name:'desc', 
				field: 'desc', 
				cellClass: 'grid-cell-text',
				headerTooltip: 'Custom header string',
				cellTooltip: function(row) { return row.entity.name; },
				enableFiltering: true,
				filter: { condition: basicFilter }
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

			$scope.gridApi = gridApi;

			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				if ((row === undefined) || (row.entity.id == null) || (row.entity.id === undefined))
					return;

				$scope.selectGpxInfo(row.entity.id);
			});
	    },
	};

	// load -------------------------------------------

	$scope.loadGpxinfos = function() {

		var successFn = function(data) { 
			
			$scope.model.gpxinfos.length = 0;
			
			data.gpxinfos.forEach(function(x) { 
				$scope.model.gpxinfos.push(x); 
			});
			
			data.gpxinfos.sort(function(a, b) { 
				return a.file_name.localeCompare(b.file_name); 
			});


			if (($scope.model.selectedGpxinfo !== undefined) && ($scope.model.selectedGpxinfo !== null)) {

				for(var i = 0; i < $scope.model.gpxinfos.length; i++) {

					if ($scope.model.gpxinfos[i].id == $scope.model.selectedGpxinfo.id) {
						$scope.model.selectedGpxinfo = $scope.model.gpxinfos[i];

						$timeout(function() {
							$scope.gridApi.selection.clearSelectedRows();
							$scope.gridApi.selection.toggleRowSelection($scope.model.selectedGpxinfo);
						}, 10);
								
						return;
					}
				}
			}

			$scope.selectFirstGridRowDelayed();
		};
		
		var errorFn = function(error){
			$scope.globalDebug(error);
		};

		httpGET($http, 'gpxinfos', null, successFn, null, errorFn)
	};

	$rootScope.$on(Event.SERVER_UPDATED, function(evt){
		$scope.loadGpxinfos();
	});

	// ----------------------------------------------
	// UI COMMANDS

	$scope.loadGpx = function(id) {
		if ($scope.model.gpxIdIsLoaded(id) == true)
			return;

		$rootScope.$emit(Command.LOAD_GPX, id);		
	};

	// ----------------------------------------------

	// INIT
	//
	$scope.loadGpxinfos();
};