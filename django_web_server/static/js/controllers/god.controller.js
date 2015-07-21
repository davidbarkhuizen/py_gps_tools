function GodController($rootScope, $scope, $http, $timeout) {

	$scope.model = new DataModel();
	$scope.gpxEditor = new GPXEditor($scope.model);

	$scope.logout = function() {
		$rootScope.$emit(Command.LOGOUT);
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// VIEWS	

	$scope.Views = Views;
	$scope.view = Views.HOME;

	$scope.gotoView = function(newView) {
		$scope.view = newView;	
	
		var bindWindow = function () {

			// focus on element marked with data-focus-element attribute 
			// 
			$scope.giveActiveViewFocus();

			// ui-grids only display correctly after this event if
			// initially rendered off-screen
			//
			//var evt = document.createEvent('HTMLEvents');
			//evt.initEvent('resize', true, false);
			//window.dispatchEvent(evt);
		};

		$timeout(bindWindow, 100);
	};

	$rootScope.$on(Command.GOTO_VIEW, function(evt, view) { 
		$scope.gotoView(view);
	});

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

		$scope.view = Views.DEBUG;
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