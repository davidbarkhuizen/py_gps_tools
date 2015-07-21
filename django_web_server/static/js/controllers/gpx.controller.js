function GpxController($rootScope, $scope, $http, $timeout) {

	var model = $scope.$parent.model;
	var gpxEditor = $scope.$parent.gpxEditor;

	// ----------------------------------
	// LOAD

	$scope.loadGpx = function(id) {

		var successFn = function(data) {

			var gpx = new GPX(data.xml, data.file_name);
			gpx.id = data.id;
			gpxEditor.loadGPX(gpx);
			$rootScope.$emit(Event.DATA_MODEL_CHANGED);

			// select 1st row
			//
			if (($scope.model.selectedGpx == undefined) || (model.gpxs.contains($scope.model.selectedGpx) == false)) {
				$scope.selectFirstGridRowDelayed();
			}
		};

		var failFn = function(status){
			console.log('fail', status);
		};

		httpGET($http, 'gpx', { 'id' : id }, successFn, failFn, $scope.globalDebug);
	};

 	$rootScope.$on(Command.LOAD_GPX, function(evt, id) {
		$scope.loadGpx(id);	
	});

	// ----------------------------------
	// UNLOAD

	$scope.unloadGpx = function(gpx) {
		
		if ($scope.model.selectedGpx == gpx)
			$scope.model.selectedGpx = undefined;

		$rootScope.$emit(Command.UNLOAD_GPX, gpx);
	};

	$scope.unloadAll = function() {

		var gpxs = model.gpxs.slice();
		gpxs.forEach(function(gpx){ $scope.unloadGpx(gpx); });
	};

	// EXPORT

	$scope.exportGpx = function(gpx) {
		$rootScope.$emit(Command.EXPORT_GPX, { gpx: gpx });
	};

	// SAVE / DISCARD CHANGES

	$scope.saveGpx = function(gpx) {

		var successFn = function(data) {
			gpx.setEditedFalse();
			$timeout(function() { $rootScope.$emit(Event.SERVER_UPDATED); }, 500);			
		};

		var failFn = function(status) {
			console.log('save gpx failed', status);
		};

		httpPATCH(
			$http, 
			'gpx', { 
				'id' : gpx.id, 
				fileName: gpx.fileName, 
				xml: gpx.toXml() 
			}, 
			successFn, 
			failFn, 
			$scope.globalDebug
			);
	};

	$scope.discardChanges = function(gpx) {
	
		$scope.unloadGpx(gpx);

		if ((gpx.id !== null) && (gpx.id !== undefined))
			$scope.loadGpx(gpx.id); 
	};

	$scope.saveOrDiscardChanges = function(gpx) {
		$rootScope.$emit(Command.OPEN_UNSAVED_CHANGES_MODAL, {
			onSave: function(){ 
				$scope.saveGpx(gpx); 
			},
			onDiscard: function(){ 
				$scope.discardChanges(gpx);
			}
		});
	};

	// GRID -----------------------

	$scope.selectGpx = function(id) {

		if ((id == null) || (id === undefined))
			return;

		model.gpxs.forEach(function(gpx) {
			if (gpx.id == id) {
				$scope.model.selectedGpx = gpx;
			}
		});
	};

	$scope.selectFirstGridRow = function() {
		$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
	}
	$scope.selectFirstGridRowDelayed = function() {
		$timeout($scope.selectFirstGridRow, 0);
	};

	// GRID EXPORT
	//
	var exportIconSrcRef = '/static/img/icon/black_button/button_black_down_16.png';
	var exportIconImgTemplate = '<img ng-src="' + exportIconSrcRef + '">';
	var exportCellTemplate = '<div style="padding-top:5px;"><a href="#" title="export gpx" ng-click="grid.appScope.exportGpx(row.entity)" ">' + exportIconImgTemplate + '</a></div>';

	// UNLOAD, SAVE CHANGES

	// UNLOAD
	//
	var unloadIconSrcRef = '/static/img/icon/black_button/button_black_minus_16.png';
	var unloadAnchorTemplate = '<a href="#" title="unload gpx" ng-show="(row.entity.edited == false)" ng-click="grid.appScope.unloadGpx(row.entity)" "><img ng-src="|||0|||"></a>'
		.replace('|||0|||', unloadIconSrcRef);

	// SAVE OR DISCARD CHANGES
	//
	var saveOrDiscardChangesIconSrcRef = '/static/img/icon/black_button/button_black_bang_16.png';
	var saveOrDiscardChangesAnchorTemplate = '<a href="#" title="unsaved changes" ng-show="(row.entity.edited == true)" ng-click="grid.appScope.saveOrDiscardChanges(row.entity);" "><img ng-src="|||0|||"></a>'
		.replace('|||0|||', saveOrDiscardChangesIconSrcRef);

	var actionCellTemplate =  '<div style="padding-top:5px;">|||0|||</div>'
		.replace('|||0|||', unloadAnchorTemplate + saveOrDiscardChangesAnchorTemplate);

	$scope.gridApi = undefined;

	$scope.updateGpxFileName = function(gpx, newFileName) {
		$rootScope.$emit(Command.UPDATE_GPX_FILENAME, { gpx: gpx, fileName: newFileName });
	};
	$scope.updateGpxName = function(gpx, newName) {
		$rootScope.$emit(Command.UPDATE_GPX_NAME, { gpx: gpx, name: newName });
	};
	$scope.updateGpxDesc = function(gpx, newDesc) {
		$rootScope.$emit(Command.UPDATE_GPX_DESC, { gpx: gpx, desc: newDesc });
	};

	$scope.gridOptions = {

		data: $scope.$parent.model.gpxs,

		enableRowSelection: true,
		multiSelect:false,
		enableSelectionBatchEvent: false, // single event only
		enableRowHeaderSelection: false, // no header, click row to select

		columnDefs: [
			{ 	
				field: 'id', 
				width: '40', 
				cellTemplate: actionCellTemplate,
				headerCellTemplate: '<span></span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{ 	
				field: 'id', 
				width: '40', 
				cellTemplate: exportCellTemplate,
				headerCellTemplate: '<span></span>',
				enableSorting: false, 
				enableHiding: false,
				enableFiltering: false,
				enableCellEdit: false,
			},
			{
				field: 'fileName',
				width: '300',
				enableHiding: false,
				enableFiltering: false,				
				headerCellTemplate: '<span>File</span>',
				cellTooltip: true,
			},
			{
				field: 'name',
				width:'300',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Name</span>',
				cellTooltip: true,
			},
			{
				field: 'desc',
				enableHiding: false,
				enableFiltering: false,
				headerCellTemplate: '<span>Description</span>',
				cellTooltip: true,
			},
			{
				field: 'waypoints',
				enableHiding: false,
				enableFiltering: false,
				width:'100',
				headerCellTemplate: '<span>Waypoints</span>',
				cellTemplate: '<span>{{ row.entity.waypoints.length }}</span>',
				enableCellEdit: false,
			},
			{
				name: 'trackCount',
				enableHiding: false,
				enableFiltering: false,
				width:'100',
				headerCellTemplate: '<span>Tracks</span>',
				cellTemplate: '<span>{{ row.entity.tracks.length }}</span>',
				enableCellEdit: false,
			}
		],

		onRegisterApi: function(gridApi) {

			$scope.gridApi = gridApi;

			// selection.on.rowSelectionChanged
			//
			gridApi.selection.on.rowSelectionChanged($scope, function(row){

				if ((row === undefined) || (row.entity.id == null) || (row.entity.id === undefined))
					return;

				$scope.selectGpx(row.entity.id);
			});

			// edit.on.afterCellEdit
			//
          	gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
	            
          		var editable = ['fileName', 'name', 'desc'];

          		if (editable.indexOf(colDef.field) == -1)
          			return;

      			switch (colDef.field) {
					case 'fileName':
						$rootScope.$emit(Command.UPDATE_GPX_FILENAME, { gpx: rowEntity, fileName: newValue});
						break;
					case 'name':
						$rootScope.$emit(Command.UPDATE_GPX_NAME, { gpx: rowEntity, name: newValue});
						break;
					case 'desc':
						$rootScope.$emit(Command.UPDATE_GPX_DESC, { gpx: rowEntity, desc: newValue});
						break;
				}
          	});
	    },
	};

	// -------------------------

	$rootScope.$on(Event.AUTH_STATE_CHANGED, function(evt, data){
		$scope.unloadAll();
	});

	$rootScope.$on(Command.SAVE_GPX, function(evt, gpx){
		$scope.saveGpx(gpx);
	});
}