function GodController($scope, $http, $timeout) {

	// Controller Element Doc Ids
	//
	$scope.elevationPlotCanvasId = 'ElevationPlotCanvas';
	$scope.fileInputId = 'ImportGpxFileInput';
	$scope.mapCanvasId = 'MapCanvas';
	
	$scope.mapSelectionAreaDivId = 'MapSelectionArea';
	$scope.showMapSelectionArea = false;

	$scope.headerText = 'GeoNodeTek';
	$scope.infoText = '';	

	$scope.mapIsLoadedAndActive = false;

	$scope.mapInfoOverlayText = [];
	$scope.showMapInfoOverlay = false;

	$scope.tracks = [];
	$scope.TrackColours = Object.freeze([Colour.BLACK, Colour.BLUE, Colour.PURPLE, Colour.DARKGREEN, Colour.RED]);

	$scope.Views = Object.freeze({
		HOME : 0,
		IMPORT : 1, 
		TRACK_LIST : 2, 
		MAP : 3,
		ELEVATION : 4
	});	
	$scope.view = $scope.Views.HOME;

	// -----------------------------------------------------	

	$scope.globalDebug = function(raw_html) {
		console.log(raw_html);
	};

	// django anti-CSRF token
	//
	$scope.getAntiCsrfTokenHeader = function() { 
		return { 'X-CSRFToken': getCookie('csrftoken') }; 
	};

	// map list, filter token, filtered list, selected item ------------

	$scope.updateInfoText = function(msg) {
		$scope.infoText = msg;
		$scope.$apply();
	};

	// NAVIGATION ---------------------------

	$scope.onTrackSelected = function(trackId) {
		console.log('useTrack ' + trackId);
	};

	$scope.selectAndLoadMap = function(mapId) {
		$scope.loadMap(mapId, false);
	};

	$scope.overlayMap = function(mapId) {
		$scope.loadMap(mapId, true);
	};

	$scope.returnToActiveMap = function() {
		if ($scope.mapIsLoadedAndActive == true) {

	    	$scope.updateHeaderTextFromTrackInfo();
	    	$scope.view = $scope.Views.MAP;
		}
	};

	$scope.gotoOpenTrack = function() {		

		$scope.headerText = 'select track to view';
		$scope.view = $scope.Views.MAP_LIST;

		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);

		$scope.onTrackSelected = $scope.selectAndLoadMap;
	}

	$scope.gotoAddTrack = function() {		

		$scope.headerText = 'select track to add to map';
		$scope.view = $scope.Views.MAP_LIST;

		$scope.onTrackSelected = $scope.overlayMap;

		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	}

	$scope.gotoAddTrack = function() {		

		$scope.headerText = 'select track to add to map';
		$scope.view = $scope.Views.MAP_LIST;

		$scope.onTrackSelected = $scope.overlayMap;

		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	}

	$scope.gotoElevationPlot = function() {

		$scope.view = $scope.Views.ELEVATION;
		$scope.$broadcast(Event.PLOT_ELEVATION);
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

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.cancelMapSelection = function() {
		$scope.$broadcast(Event.CANCEL_MAP_SELECTION);
		$scope.showMapSelectionArea = false;
	};

	$scope.zoomOut = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_OUT);
	}

	$scope.zoomIn = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_IN);
	}	

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.getMap = function(id, overlay) {

		var req =
			{
				headers: { "Content-Type": "charset=utf-8" },
				method: 'GET',
				url: '/map/',
				params: { 'id' : id }
			};

		var successFn = function(data) { 
			$scope.processIncomingTrackData(data, overlay); 
		};

		var errorFn = function(error){
			console.log('error');
			$scope.error = error;
		};

		$http(req)
		.success(successFn)
		.error(errorFn);
	};

	$scope.loadMap = function(mapId, overlay){
		$scope.getMap(mapId, overlay);
		$scope.updateMapInfoOverlayText();
	};
	
	$scope.updateMapInfoOverlayText = function() {

		var texts = [];

		for(var t in $scope.tracks) {
			var track = $scope.tracks[t];

			texts.push(track.name);
			texts.push(track.periodString);
			texts.push(track.dayCountString)
		}

		$scope.mapInfoOverlayText = texts;
	};

	// -------------------------------------------------------

	$scope.updateHeaderTextFromTrackInfo = function() {
		
		var text = '';

		if ($scope.tracks.length == 0)
			text = 'on tracks'
		else if ($scope.tracks.length == 1)
			text = $scope.tracks[0].name;
		else
			text = 'multiple tracks (see track info)';		

    	$scope.headerText = text;
	};

	$scope.processIncomingTrackData = function(trackData, overlay) {

		if (!overlay) {
			$scope.tracks.length = 0;
		}

		var newTrack = new Track(trackData);
		$scope.tracks.push(newTrack);

		// HACK
		newTrack.color = $scope.TrackColours[$scope.tracks.length - 1];

		$scope.$broadcast(Event.MAP_REFRESH);		

		$scope.updateMapInfoOverlayText();

    	$scope.mapIsLoadedAndActive = true;
    	$scope.updateHeaderTextFromTrackInfo();
    	$scope.view = $scope.Views.MAP;    	
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// handlers for events emitted by child controllers	

	$scope.$on(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED, function(evt) {

		if ($scope.view == $scope.Views.IMPORT) {
			$scope.view = $scope.Views.MAP_LIST;
		}
	});	

	$scope.$on(Event.MAP_SELECTION_BEGUN, function(evt) {
		$scope.showMapSelectionArea = true;
		$scope.$apply();
	});	

	$scope.$on(Event.INFO_TEXT_UPDATE, function(evt, infoText) {
		$scope.infoText = infoText;
		$scope.$apply();
	});
};