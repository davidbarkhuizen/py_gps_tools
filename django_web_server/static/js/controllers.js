var geoNodeTekApp = angular.module('geoNodeTekApp', []);

geoNodeTekApp.controller('GeoNodeTekController', function ($scope, $http, $timeout) {

	$scope.globalDebug = function(raw_html) {
		window.open('/echo/?' + raw_html, '_blank', '');
	};

	// django anti-CSRF token -------------

	$scope.getCookie = function (name) {
	    
	    var cookieValue = null;

	    if (document.cookie && document.cookie != '') {
	        var cookies = document.cookie.split(';');
	        for (var i = 0; i < cookies.length; i++) {
	            var cookie = cookies[i].trim();
	            if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                break;
	            }
	        }
	    }

	    return cookieValue;
	};

	$scope.genCsrfTokenDict = function() {
		var headerDict = { 'X-CSRFToken': $scope.getCookie('csrftoken') };
		return headerDict;
	};

	// map list, filter token, filtered list, selected item ------------

	$scope.headerText = 'GeoNodeTek';

	$scope.mapList = [];
	$scope.mapSearchToken = '';
	$scope.filteredMapList = [];
	$scope.selectedMap = [];

	$scope.mapIsLoadedAndActive = false;

	// show/hide ui sections and navigation ---------------------------

	$scope.showMapList = false;
	$scope.showMap = false;
	$scope.showImportSection = false;

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
			$scope.showMap = true;
			$scope.showImportSection = false;
			$scope.showMapList = false;
		}
	};

	$scope.gotoOpenMap = function() {		
		$scope.headerText = 'open a map';
		$scope.showMap = false;
		$scope.showMapList = true;

		$scope.mapListItemClicked = $scope.selectAndLoadMap;
	}

	$scope.gotoOverlayMap = function() {		
		$scope.headerText = 'overlay a map';
		$scope.showMap = false;
		$scope.showMapList = true;

		$scope.mapListItemClicked = $scope.overlayMap;
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

	$scope.launchFileImport = function() {

		$scope.showImportSection = true;
		$scope.showMapList = false;
		$scope.showMap = false;
	};

	$scope.postMapDataFiles = function() {

		var postMapDataFilesRecursive = function(files) {

			var file = files[0];

			var remainder = [];
			for (var i = 1; i < files.length; i++) {
				remainder.push(files[i])
			};

			var clearInput = function(id) {

				var input = document.getElementById(id);
				try{
				    input.value = '';
				    if(input.value){
				        input.type = "text";
				        input.type = "file";
				    }
				} catch(e){

				}
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
			    			$scope.showImportSection = false;
			    			$scope.showMapList = true;
			    		}
				    	else {
				    		postMapDataFilesRecursive(remainder);
				    	}
					};

					$http({
					    url: '/mapfile/',
					    method: 'POST',
					    data: packet,
	 					headers: $scope.genCsrfTokenDict()
					}).success(successFn).error(function(data, status, headers, config) {
						$scope.showImportSection = false;
						$scope.showMapList = true;
					    console.log('ERROR:  ' + data);
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

	$scope.processIncomingTrackData = function(trackData, overlay) {

		if (overlay) {}
		else { $scope.tracks.length = 0; }

		$scope.tracks.push(new Track(trackData));
		$scope.gfx.draw($scope.tracks);

    	$scope.mapIsLoadedAndActive = true;
    	$scope.showMap = true;
    	$scope.showMapList = false;
    	$scope.showImportSection = false;
	};

	$scope.gfx = new Gfx('canvas');

	$scope.getMapList();
	$timeout(function() { document.getElementById("MapListFilterToken").focus(); }, 0 );
});