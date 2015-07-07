function GpxImportController($rootScope, $scope, $http, $timeout) {

	$scope.fileInputId = $scope.$parent.fileInputId;
	$scope.fileInput = document.getElementById($scope.fileInputId);

	$scope.browsedFiles = [];
	$scope.fileQueue = [];
	
	$scope.failedImports = [];
	$scope.successfulImports = [];

	$scope.importing = false;

	$scope.cancelFileSelection = function() {
		$scope.browsedFiles.length = 0;
	}; 

	$scope.uploadNextFile = function() {

		if ($scope.fileQueue.length == 0) {
			$scope.importing = false;			
			return;
		}

		var file = $scope.fileQueue.pop(0);

		var onLoad = function(evt) {

			var data = {
				'fileName' : file.name,
				'xml' : evt.target.result
			};

			var next = function() {
		    	if ($scope.fileQueue.length > 0) {
		    		$scope.uploadNextFile();
	    		}
			};

			var successFn = function(data, status, headers, config) {

				$rootScope.$emit(Event.SERVER_UPDATED);
				$scope.successfulImports.push(file);
				next();
			};

			var failureFn = function(message) {
				
				file.importFailureMessage = message;
			    $scope.failedImports.push(file);
			    $scope.uploadNextFile();
			};

			var errorFn = function(error) {
			    $rootScope.$emit(Event.DEBUG_ERROR, error);
			};

			httpPOST($http, 'gpxfile', data, successFn, failureFn, errorFn);
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

	$scope.importSelectedFiles = function() {

		var files = $scope.fileInput.files;

		if (files.length == 0)
			return;

		$scope.postMapDataFilesRecursive(files);
	};

	$scope.browseFiles = function() {
		$scope.fileInput.click();
	};	

	$scope.filesChanged = function(fileElement) {
		
		for(var i = 0; i < $scope.fileInput.files.length; i++) {
			$scope.browsedFiles.push($scope.fileInput.files[i]);			
		}

		clearFileInput($scope.fileInputId);
		
		$scope.$apply(); // WTF
	};

	$scope.importFiles = function() {
		
		while ($scope.browsedFiles.length > 0) {
			var f = $scope.browsedFiles.pop();
			$scope.fileQueue.push(f);
		}

		$scope.uploadNextFile();
	};
}