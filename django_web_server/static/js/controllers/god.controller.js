function GodController($scope, $http, $timeout) {

	// Controller Element Doc Ids
	//
	$scope.elevationPlotCanvasId = 'ElevationPlotCanvas';
	$scope.fileInputId = 'ImportGpxFileInput';
	$scope.mapCanvasId = 'MapCanvas';
	
	$scope.mapSelectionAreaDivId = 'MapSelectionArea';

	$scope.headerText = 'GeoNodeTek';
	$scope.infoText = '';	

	$scope.mapIsLoadedAndActive = false;

	$scope.tracks = [];
	$scope.TrackColours = Object.freeze([Colour.BLACK, Colour.BLUE, Colour.PURPLE, Colour.DARKGREEN, Colour.RED]);

	$scope.Views = Object.freeze({
		HOME : guid(),
		IMPORT : guid(), 
		TRACK_LIST : guid(), 
		ACTIVE_TRACK_LIST : guid(),
		MAP : guid(),
		ELEVATION : guid(),
		STATS : guid(),
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

	$scope.selectAndLoadTrack = function(trackId) {
		$scope.loadTrack(trackId, false);
	};

	$scope.addTrack = function(trackId) {
		$scope.loadTrack(trackId, true);
	};

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

		$scope.headerText = 'select track to view';
		$scope.view = $scope.Views.MAP_LIST;

		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);

		$scope.onTrackSelected = $scope.selectAndLoadTrack;
	}

	$scope.gotoAddTrack = function() {		

		$scope.headerText = 'select a track to add to the map';
		$scope.view = $scope.Views.MAP_LIST;
		$scope.onTrackSelected = $scope.addTrack;
		$timeout(function() { focusOnId('TrackListFilterToken'); }, 10);
	}

	$scope.gotoRemoveTrack = function() {

		if ($scope.tracks.length <= 1)
			return;

		$scope.headerText = 'select a track to remove from the map';
		$scope.view = $scope.Views.ACTIVE_TRACK_LIST;		
		// $scope.onTrackSelected = $scope.removeTrack;	
	};

	$scope.gotoElevationPlot = function() {

		$scope.headerText = 'elevation @ ' + $scope.tracks[0].name;
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
	};

	$scope.zoomOut = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_OUT);
	}

	$scope.zoomIn = function() {		
		$scope.$broadcast(Event.MAP_ZOOM_IN);
	}	

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.getTrack = function(id, overlay) {

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

	$scope.loadTrack = function(trackId, overlay){

		var matches = $scope.tracks.filter(function(track){return (track.id == trackId);});
		if (matches.length > 0)
		{
			$scope.view = $scope.Views.MAP;
			return;
		}

		$scope.getTrack(trackId, overlay);
	};
	
	// -------------------------------------------------------

	$scope.processIncomingTrackData = function(trackData, overlay) {

		if (!overlay) {
			$scope.tracks.length = 0;
		}

		var newTrack = new Track(trackData);
		$scope.tracks.push(newTrack);

		// COLOUR LOGIC
		
		// used
		var coloursInUse = [];
		for (i = 0; i < $scope.tracks.length; i++) {
			coloursInUse.push($scope.tracks[i].colour);
		}

		// unused
		var unusedColours = [];
		for (var colourName in $scope.TrackColours) {
			var colour = $scope.TrackColours[colourName];

			if (coloursInUse.indexOf(colour) == -1) {
				unusedColours.push(colour);
			}
		}

		newTrack.colour = unusedColours[0];

		$scope.$broadcast(Event.MAP_REFRESH);		

    	$scope.mapIsLoadedAndActive = true;
    	$scope.headerText = 'map';
    	$scope.view = $scope.Views.MAP;    	
	};

	$scope.removeTrack = function (trackId) {

		function retain(track) {
			return (track.id !== trackId);
		};

		var toRetain = $scope.tracks.filter(retain);

		function addToTracks(track) { $scope.tracks.push(track); };

		$scope.tracks.length = 0;

		toRetain.forEach(addToTracks);

		$scope.$broadcast(Event.MAP_REFRESH);

		$scope.view = $scope.Views.MAP;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// handlers for events emitted by child controllers	

	$scope.$on(Command.REMOVE_TRACK, function(evt, trackId) {
		$scope.removeTrack(trackId);
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
};