function GodController($rootScope, $scope, $http, $timeout) {

	$scope.tracks = [];

	$scope.model = {
		trackInfos : [],
		waypoints : [],
		filteredWaypoints : [],
		selectedPoint : null
	};

	$scope.Views = Object.freeze({
		DEBUG : guid(),
		HOME : guid(),

		IMPORT : guid(), 
		EXPORT : guid(),

		TRACK_DATABASE : guid(),

		MAP : guid(),
		LOADED_TRACKS : guid(), 
		ELEVATION : guid(),
		WAYPOINTS : guid(),
	});	
	
	$scope.view = $scope.Views.HOME;

	$scope.giveActiveViewFocus = function() {
		
		// data-focus-element

		var views = document
			.getElementById('viewport')
			.childNodes;

		for(var i = 0; i < views.length; i++) {

			var className = views[i].className;

			if (className !== undefined) {
				if ((' ' + className + ' ').indexOf(' ' + 'ng-hide' + ' ') == -1) {

					var q =  '[' + 'data-focus-element' + ']';
					var focusElement = views[i].querySelector(q);
					if (focusElement)
						focusElement.focus();
				}
			}
		}
	};

	$scope.onViewChange = function() {
		$timeout($scope.giveActiveViewFocus, 100);
	};

	// Controller Element Doc Ids
	//
	$scope.elevationPlotCanvasId = 'ElevationPlotCanvas';
	$scope.fileInputId = 'ImportGpxFileInput';
	$scope.mapCanvasId = 'MapCanvas';
	
	$scope.mapSelectionAreaDivId = 'MapSelectionArea';

	$scope.headerText = 'GeoNodeTek';
	$scope.infoText = '';	

	// map list, filter token, filtered list, selected item ------------

	$scope.updateInfoText = function(msg) {
		$scope.infoText = msg;
		$scope.$apply();
	};

	// NAVIGATION ---------------------------

	$scope.gotoMap = function() {

		if ($scope.tracks.length > 0) {
	    	$scope.headerText = 'map';
	    	$scope.view = $scope.Views.MAP;
		}
	};

	// -------------------------------------------------------------------
	// GPX IMPORT - EXPORT

	$scope.gotoGpxExport = function() {

		var xml = waypointsToGpx($scope.model.waypoints);

		$scope.$broadcast(Command.MAKE_GPX_FILE_AVAILABLE_FOR_EXPORT, { xml : xml, fileName : 'cat' });
    	//$scope.view = $scope.Views.EXPORT;
	};

	$scope.$on(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED, function(evt) {

		if ($scope.view == $scope.Views.IMPORT) {
			$scope.gotoOpenTrack();
		}
	});

	// -------------------------------------------------------------------

	/*
	context.save();
	context.translate(newx, newy);
	context.rotate(-Math.PI/2);
	context.textAlign = "center";
	context.fillText("Your Label Here", labelXposition, 0);
	context.restore();
	 */

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.$on(Event.MAP_SELECTION_BEGUN, function(evt) {
		$scope.$apply();
	});	

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// TRACK

	$rootScope.$on(Event.TRACK_LOADED, function (evt) {
		$scope.view = $scope.Views.MAP;
	});

	// DEBUG ----------------------------------------

	var debugSummaryElement = document.getElementById('DebugSummary');
	var debugTraceElement = document.getElementById('DebugTrace');
	var dummyRoot = document.createElement('div');

	$scope.globalDebug = function(raw_html) {

		debugSummaryElement.innerHTML = '';
		debugTraceElement.innerHTML = '';
		
		dummyRoot.innerHTML = raw_html;

		var summaryE = dummyRoot
			.querySelector("#summary");

		debugSummaryElement.innerHTML = summaryE.innerHTML;

		var traceE = dummyRoot
			.querySelector("#traceback");

		debugTraceElement.innerHTML = traceE.innerHTML;

		$scope.view = $scope.Views.DEBUG;
	};

	$scope.$on(Event.AJAX_ERROR, function(evt, error) {
		$scope.globalDebug(error);
	});
};