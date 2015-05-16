function GodController($scope, $http, $timeout) {

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

		MAP : guid(),
		LOADED_TRACKS : guid(), 
		ELEVATION : guid(),
		STATS : guid(),
		WAYPOINTS : guid(),
	});	
	$scope.view = $scope.Views.HOME;

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

	$scope.gotoGpxImport = function() {
		$scope.view = $scope.Views.IMPORT;
	};

	$scope.$on(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED, function(evt) {

		if ($scope.view == $scope.Views.IMPORT) {
			$scope.gotoOpenTrack();
		}
	});

	$scope.$on(Event.WAYPOINTS_EXPORT_REQUESTED, function(evt, waypoints) {
		$scope.$broadcast(Command.EXPORT_WAYPOINTS, waypoints);		
	});

	// -------------------------------------------------------------------

	$scope.gotoStats = function() {
		$scope.headerText = 'statistics';
		$scope.view = $scope.Views.STATS;
	};

	$scope.gotoElevationPlot = function() {

		$scope.headerText = 'elevation @ ' + $scope.tracks[0].name;
		$scope.view = $scope.Views.ELEVATION;
		$scope.$broadcast(Event.PLOT_ELEVATION);
	};

	$scope.gotoWaypoints = function() {

		$scope.$broadcast(Command.REFRESH_WAYPOINTS);
		$scope.headerText = 'waypoints';
		$scope.view = $scope.Views.WAYPOINTS;
	};

	$scope.areaSelectWaypoints = function() {
		$scope.$broadcast(Command.AREA_SELECT_WAYPOINTS);
		$scope.view = $scope.Views.WAYPOINTS;
	};

	/*
	context.save();
	context.translate(newx, newy);
	context.rotate(-Math.PI/2);
	context.textAlign = "center";
	context.fillText("Your Label Here", labelXposition, 0);
	context.restore();
	 */

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.cancelMapSelection = function() {
		$scope.$broadcast(Event.CANCEL_MAP_SELECTION);
	};

	$scope.zoomOut = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_OUT);
	}

	$scope.zoomIn = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_IN);
	};

	$scope.$on(Event.MAP_SELECTION_BEGUN, function(evt) {
		$scope.$apply();
	});	

	$scope.$on(Event.INFO_TEXT_UPDATE, function(evt, infoText) {
		$scope.infoText = infoText;
		$scope.$apply();
	});

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// WAYPOINTS

	$scope.$on(Event.WAYPOINT_DELETED, function(evt, id) {
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);		
	});

	$scope.$on(Event.WAYPOINT_ADDED, function(evt) {
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);		
	});	

	$scope.$on(Event.WAYPOINT_EDITED, function(evt) {
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);		
	});
	
	$scope.$on(Event.WAYPOINT_UNLOADED, function(evt) {
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);		
	});	

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// TRACK

	$scope.onTrackSelected = undefined;
	$scope.$on(Event.TRACK_SELECTED, function(evt, id) {
		$scope.onTrackSelected(id);
	});

	$scope.gotoOpenTrack = function() {		

		$scope.onTrackSelected = function(id) { $scope.broadcastLOAD_TRACK(id); };
		$scope.view = $scope.Views.MAP_LIST;
		$scope.headerText = 'select track to view';
		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	};

	$scope.gotoAddTrack = function() {		

		$scope.onTrackSelected = function(id) { $scope.broadcastLOAD_TRACK(id, true); };
		$scope.headerText = 'select a track to add to the map';
		$scope.view = $scope.Views.MAP_LIST;		
		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	};

	$scope.broadcastLOAD_TRACK = function(id, overlay) {
		$scope.$broadcast(Command.LOAD_TRACK, { 'id' : id, 'overlay' : overlay });
	};

	$scope.$on(Event.TRACK_LOADED, function (evt, id) {
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);
		$scope.view = $scope.Views.MAP;
		$scope.$broadcast(Command.LOAD_WAYPOINTS_FOR_TRACK, id);
	});

	$scope.gotoUnloadTrack = function() {

		if ($scope.tracks.length <= 1)
			return;

		$scope.headerText = 'select a track to unload';
		$scope.view = $scope.Views.LOADED_TRACKS;
	};

	$scope.$on(Event.TRACK_UNLOADED, function (evt, id) {
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);
	});

	$scope.$on(Command.UNLOAD_TRACK, function(evt, id) {
		$scope.unloadTrack(id);
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