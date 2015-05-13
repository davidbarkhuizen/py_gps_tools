function GodController($scope, $http, $timeout) {

	$scope.tracks = [];

	$scope.model = {
		trackInfos : [],
	};

	$scope.Views = Object.freeze({
		HOME : guid(),
		IMPORT : guid(), 
		TRACK_LIST : guid(), 
		ACTIVE_TRACK_LIST : guid(),
		MAP : guid(),
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

	$scope.mapIsLoadedAndActive = false;

	// map list, filter token, filtered list, selected item ------------

	$scope.updateInfoText = function(msg) {
		$scope.infoText = msg;
		$scope.$apply();
	};

	// NAVIGATION ---------------------------

	$scope.returnToActiveMap = function() {
		if ($scope.mapIsLoadedAndActive == true) {

	    	$scope.headerText = 'map';
	    	$scope.view = $scope.Views.MAP;
		}
	};

	$scope.gotoStats = function() {
		$scope.headerText = 'statistics';
		$scope.view = $scope.Views.STATS;
	};

	$scope.gotoOpenTrack = function() {		

		$scope.onTrackSelected = function(id) { $scope.loadTrack(id); };
		$scope.view = $scope.Views.MAP_LIST;
		$scope.headerText = 'select track to view';
		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	}

	$scope.gotoAddTrack = function() {		

		$scope.onTrackSelected = function(id) { $scope.loadTrack(id, true); };
		$scope.headerText = 'select a track to add to the map';
		$scope.view = $scope.Views.MAP_LIST;		
		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	}

	$scope.gotoUnloadTrack = function() {

		if ($scope.tracks.length <= 1)
			return;

		$scope.headerText = 'select a track to remove from the map';
		$scope.view = $scope.Views.ACTIVE_TRACK_LIST;		
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

	/*
	context.save();
	context.translate(newx, newy);
	context.rotate(-Math.PI/2);
	context.textAlign = "center";
	context.fillText("Your Label Here", labelXposition, 0);
	context.restore();
	 */

	$scope.launchGpxImport = function() {

		$scope.view = $scope.Views.IMPORT;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.cancelMapSelection = function() {
		$scope.$broadcast(Event.CANCEL_MAP_SELECTION);
	};

	$scope.zoomOut = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_OUT);
	}

	$scope.zoomIn = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_IN);
	}	

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-


	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// handlers for events emitted by child controllers	

	$scope.$on(Command.UNLOAD_TRACK, function(evt, id) {
		$scope.unloadTrack(id);
	});

	$scope.$on(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED, function(evt) {

		if ($scope.view == $scope.Views.IMPORT) {
			$scope.view = $scope.Views.MAP_LIST;
		}
	});	

	$scope.$on(Event.MAP_SELECTION_BEGUN, function(evt) {
		$scope.$apply();
	});	

	$scope.$on(Event.INFO_TEXT_UPDATE, function(evt, infoText) {
		$scope.infoText = infoText;
		$scope.$apply();
	});

	$scope.$on(Event.WAYPOINT_DELETED, function(evt, id) {

		$scope.tracks.forEach(function(track) { track.removeWaypoint(id); });
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);		
	});

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// TRACK

	$scope.loadTrack = function(id) {
		$scope.$broadcast(Command.LOAD_TRACK, id);
	}

	$scope.$on(Event.TRACK_LOADED, function (evt, id) {
		console.log('god - $scope.on(Event.TRACK_LOADED');
		console.log($scope.tracks);
		$scope.$broadcast(Event.DATA_MODEL_CHANGED);
		$scope.view = $scope.Views.MAP;
	});

	// ------------------------------------------------------
	// Track Info Controller

	$scope.onTrackSelected = undefined;
	$scope.$on(Event.TRACK_SELECTED, function(evt, id) {
		$scope.onTrackSelected(id);
	});

	// DEBUG ----------------------------------------

	$scope.globalDebug = function(raw_html) {
		
		var start = raw_html.indexOf('<div id="summary">');
		var end = raw_html.indexOf('<div id="traceback">');
		var section = raw_html.substring(start, end);
		console.log(section);
	};

	$scope.$on(Event.AJAX_ERROR, function(evt, error) {
		$scope.globalDebug(error);
	});
};