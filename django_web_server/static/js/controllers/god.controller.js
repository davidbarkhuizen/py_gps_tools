function GodController($scope, $http, $timeout) {

	$scope.elevationPlotCanvasId = 'ElevationPlotCanvas';

	$scope.globalDebug = function(raw_html) {
		window.open('/echo/?' + raw_html, '_blank', '');
	};

	// django anti-CSRF token
	//
	$scope.getAntiCsrfTokenHeader = function() { 
		return { 'X-CSRFToken': getCookie('csrftoken') }; 
	};

	// map list, filter token, filtered list, selected item ------------

	$scope.headerText = 'GeoNodeTek';

	$scope.infoText = '';
	$scope.updateInfoText = function(msg) {
		$scope.infoText = msg;
		$scope.$apply();
	};

	$scope.mapInfoOverlayText = [];

	$scope.mapIsLoadedAndActive = false;

	$scope.TrackColours = Object.freeze([Colour.BLACK, Colour.VERYDARKGREY, Colour.BLUE, Colour.PURPLE, Colour.DARKGREEN, Colour.RED]);

	// SHOW ---------------------------------

	$scope.Views = Object.freeze({
		HOME : 0,
		IMPORT : 1, 
		TRACK_LIST : 2, 
		MAP : 3,
		ELEVATION : 4
	});	
	$scope.view = $scope.Views.HOME;

	$scope.showMapInfoOverlay = false

	// NAVIGATION ---------------------------

	$scope.onTrackSelected = function(trackId) { console.log('useTrack ' + trackId); };

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
		$scope.$broadcast(GodControllerEvents.PLOT_ELEVATION);
	};

	/*
	context.save();
	context.translate(newx, newy);
	context.rotate(-Math.PI/2);
	context.textAlign = "center";
	context.fillText("Your Label Here", labelXposition, 0);
	context.restore();
	 */

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.cancelSelection = function() {
		$scope.gfx.cancelSelection();
	};

	$scope.zoomOut = function() {		
		$scope.gfx.zoomOut();
	}

	$scope.zoomIn = function() {		
		$scope.gfx.zoomIn();
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
	// FILE IMPORT

	$scope.launchGpxImport = function() {

		$scope.view = $scope.Views.IMPORT;
	};

	$scope.postMapDataFiles = function() {

		var postMapDataFilesRecursive = function(files) {

			var file = files[0];

			var remainder = [];
			for (var i = 1; i < files.length; i++) {
				remainder.push(files[i])
			};	

			var onLoad = function(evt) {

					var packet = {
						'fileName' : file.name,
						'fileString' : evt.target.result
					};

					var successFn = function(data, status, headers, config) {

						if (data.code == 'ok') {
					    	$scope.getTrackList();
				    	}						

				    	if (remainder.length == 0) {

				    		if ($scope.view == $scope.Views.IMPORT) {
				    			$scope.view = $scope.Views.MAP_LIST;
				    		}
			    		}
				    	else {
				    		postMapDataFilesRecursive(remainder);
				    	}
					};

					$http({
					    url: '/mapfile/',
					    method: 'POST',
					    data: packet,
	 					headers: $scope.getAntiCsrfTokenHeader()
					}).success(successFn).error(function(data, status, headers, config) {
						$scope.showImportSection = false;
						$scope.showTrackList = true;
					    $scope.globalDebug(data);
					});

				};

			var reader = new FileReader(); 

			reader.onload = onLoad; 

			reader.onerror = function(evt) {
				console.log('error reading file @ ' + file);
				console.log(evt);
				console.log('terminating');
			};

			reader.readAsText(file, "UTF-8");
		};

		var files = document.getElementById('ImportMapFileInput').files;
		postMapDataFilesRecursive(files);
	};

	// -------------------------------------------------------

	$scope.tracks = [];

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

		if (overlay) {

		}
		else { 
			$scope.tracks.length = 0;
		}

		var newTrack = new Track(trackData);
		$scope.tracks.push(newTrack);

		// HACK
		newTrack.color = $scope.TrackColours[$scope.tracks.length - 1];

		var resetMapViewPort = (!overlay);
		$scope.gfx.draw($scope.tracks, resetMapViewPort);

		$scope.updateMapInfoOverlayText();

    	$scope.mapIsLoadedAndActive = true;
    	$scope.updateHeaderTextFromTrackInfo();
    	$scope.view = $scope.Views.MAP;    	
	};

	// START-UP

	$scope.gfx = new Gfx('canvas', $scope.updateInfoText);
}