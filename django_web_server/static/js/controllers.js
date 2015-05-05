var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('GeoNodeTekController', function ($scope, $http, $timeout) {

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

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];
	$scope.mapInfoOverlayText = [];

	$scope.mapIsLoadedAndActive = false;

	// SHOW ---------------------------------

	$scope.Views = Object.freeze({
		HOME : 0,
		IMPORT : 1, 
		TRACK_LIST : 2, 
		MAP : 3
	});
	
	$scope.view = $scope.Views.HOME;

	$scope.showMapInfoOverlay = false

	// NAVIGATION ---------------------------

	$scope.mapListItemClicked = undefined;

	$scope.selectAndLoadMap = function(mapId) {
		$scope.selectMapById(mapId);
		$scope.loadMap(mapId, false);
	};

	$scope.overlayMap = function(mapId) {
		$scope.loadMap(mapId, true);
	};

	$scope.returnToActiveMap = function() {
		if ($scope.mapIsLoadedAndActive == true) {

	    	$scope.updateHeaderTextFromTrackNames();
	    	$scope.view = $scope.Views.MAP;
		}
	};
	$scope.gotoOpenTrack = function() {		

		$scope.headerText = 'select track to view';
		$scope.view = $scope.Views.MAP_LIST;

		$timeout(function() { focusOnId('MapListFilterToken'); }, 10);

		$scope.mapListItemClicked = $scope.selectAndLoadMap;
	}

	$scope.gotoOverlayMap = function() {		

		$scope.headerText = 'select track to add to map';
		$scope.view = $scope.Views.MAP_LIST;

		$scope.mapListItemClicked = $scope.overlayMap;

		$timeout(function() { focusOnId('MapListFilterToken'); }, 10);
	}

	$scope.zoomOut = function() {		
		$scope.gfx.zoomOut();
	}

	// MAP LIST -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	$scope.getMapList = function() {

		var headers = { "Content-Type": "charset=utf-8" };
		var request = { method: 'GET', url: "/maplist/", headers: headers };

		var successFn = function(response) { 
			$scope.loadMapList(response.maps); 
		};
		var errorFn = function(error){
			$scope.globalDebug(error);
		};

		$http(request).success(successFn).error(errorFn);
	};

	$scope.loadMapList = function(mapList) {

		$scope.mapList.length = 0;
		for(var i in mapList){
			$scope.mapList.push(mapList[i]);
		}

		$scope.filterMapList();
	};

	$scope.filterMapList = function() {		

		matches = [];

		// filter to matches
		//
		for(var i in $scope.mapList) {
			if ($scope.mapList[i].name.toUpperCase().indexOf($scope.mapSearchToken.toUpperCase()) !== -1) {
				matches.push($scope.mapList[i]);
			}
		}

		// sort matches
		//
		matches.sort(function(a, b) { return a > b; });

		// update filtered map list
		//
		$scope.filteredMapList.length = 0;
		if (matches.length > 0) {			
			for(var i in matches) {
				$scope.filteredMapList.push(matches[i]);
			}
		}

		// auto-select from matches
		//
		$scope.selectedMap.length = 0;
		if (!(($scope.filteredMapList == undefined) || ($scope.filteredMapList.length == 0))) {
			$scope.selectedMap.push($scope.filteredMapList[0]);
		}
	};

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

	$scope.selectMapById = function(id) {

		if ($scope.selectedMap.id == id)
			return;

		for (var i in $scope.filteredMapList) {
			if ($scope.filteredMapList[i].id == id) {
				$scope.selectedMap.length = 0;
				$scope.selectedMap.push($scope.filteredMapList[i]);
				break;
			}
		}
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
					    	$scope.getMapList();
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
						$scope.showMapList = true;
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

	$scope.updateHeaderTextFromTrackNames = function() {
		
		var trackText = undefined;
    	
    	for(var t in $scope.tracks) {
    		trackText = (trackText == undefined )
    			? $scope.tracks[t].name
    			: trackText + ' / ' + $scope.tracks[t].name;
    	}

    	$scope.headerText = trackText;
	};

	$scope.processIncomingTrackData = function(trackData, overlay) {

		if (overlay) {

		}
		else { 
			$scope.tracks.length = 0;
		}

		$scope.tracks.push(new Track(trackData));
		var resetMapViewPort = (!overlay);
		$scope.gfx.draw($scope.tracks, resetMapViewPort);

		$scope.updateMapInfoOverlayText();

    	$scope.mapIsLoadedAndActive = true;
    	$scope.updateHeaderTextFromTrackNames();
    	$scope.view = $scope.Views.MAP;    	
	};

	// START-UP

	$scope.gfx = new Gfx('canvas', $scope.updateInfoText);

	$scope.getMapList();
});