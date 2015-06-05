function GodController($rootScope, $scope, $http, $timeout) {

	$scope.tracks = [];

	$scope.model = {
		gpxinfos : [],
		waypoints : [],
		filteredWaypoints : [],
		selectedPoint : null
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// VIEWS

	$scope.Views = Object.freeze({
		DEBUG : guid(),
		HOME : guid(),

		IMPORT : guid(), 
		EXPORT : guid(),

		GPX_DATABASE : guid(),

		MAP : guid(),
		LOADED_TRACKS : guid(), 
		ELEVATION : guid(),
		WAYPOINTS : guid(),
	});	
	
	$scope.view = $scope.Views.HOME;

	$scope.gotoView = function(newView) {
		$scope.view = newView;	
		$timeout($scope.giveActiveViewFocus, 100);
	};

	$rootScope.$on(Command.GOTO_VIEW, function(evt, view) { $scope.view = view; });

	$rootScope.$on(Event.DEBUG_ERROR, function(evt, error) {
		$scope.globalDebug(error);
	});

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

	// Controller Element Doc Ids
	//
	$scope.fileInputId = 'ImportGpxFileInput';

	// -------------------------------------------------------------------
	// GPX IMPORT - EXPORT

	$rootScope.$on(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED, function(evt) {

		if ($scope.view == $scope.Views.IMPORT) {
			// $scope.view = $scope.Views.GPX_DATABASE;
		}
	});

	// -------------------------------------------------------------------
	// TRACK

	$rootScope.$on(Event.TRACK_LOADED, function (evt) {
		$scope.view = $scope.Views.MAP;
	});

	// -------------------------------------------------------------------
	// DEBUG

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

	$rootScope.$on(Event.DEBUG_ERROR, function(evt, error) {
		$scope.globalDebug(error);
	});

	// WINDOW / LAYOUT ----------------------------------------

	$scope.getWindowDimensions = function() {

		var navbar = document.getElementById('navbar');
		var fudge = navbar.parentNode.offsetHeight + 10;

		var dims = {
			height : window.innerHeight - fudge, 
			width : document.body.offsetWidth
		};

		return dims;
	};
};