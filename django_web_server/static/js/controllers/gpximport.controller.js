function GpxImportController($scope, $http, $timeout) {

	$scope.fileInputId = $scope.$parent.fileInputId;

	$scope.postMapDataFilesRecursive = function(files) {

		var file = files[0];

		var remainder = [];
		for (var i = 1; i < files.length; i++) {
			remainder.push(files[i])
		};	

		var onLoad = function(evt) {

			var data = {
				'fileName' : file.name,
				'xml' : evt.target.result
			};

			var next = function() {
		    	if (remainder.length == 0) {
		    		clearFileInput($scope.fileInputId);
		    		$scope.$emit(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED);
	    		}
		    	else {
		    		$scope.postMapDataFilesRecursive(remainder);
		    	}
			};

			var successFn = function(data, status, headers, config) {

				$scope.$emit(Event.GPX_FILE_IMPORTED);
				next();
			};

			var failureFn = function(message) {
				
			    console.log('gpx file import failed:  ' + message);
			    next();
			};

			var errorFn = function(error) {
			    $scope.$emit(Event.AJAX_ERROR, error);
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

		var files = document
			.getElementById($scope.fileInputId)
			.files;

		if (files.length == 0)
			return;

		$scope.postMapDataFilesRecursive(files);
	};
}