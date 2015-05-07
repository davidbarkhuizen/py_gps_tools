function GpxImportController($scope, $http, $timeout) {

	$scope.fileInputId = $scope.$parent.fileInputId;

	$scope.postMapDataFilesRecursive = function(files) {

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
			    	$scope.$emit(Event.GPX_FILE_IMPORTED);
		    	}						
		    	else  {
		    		$scope.$emit(Event.GPX_FILE_IMPORT_FAILED);
		    	}

		    	if (remainder.length == 0) {
		    		clearFileInput($scope.fileInputId);
		    		$scope.$emit(Event.GPX_FILE_IMPORT_PROCESS_COMPLETED);
	    		}
		    	else {
		    		$scope.postMapDataFilesRecursive(remainder);
		    	}
			};

			var errorFn = function(data, status, headers, config) {
			    $scope.$parent.globalDebug(data);
			};

			$http({
			    url: '/mapfile/',
			    method: 'POST',
			    data: packet,
				headers: $scope.$parent.getAntiCsrfTokenHeader()
			})
			.success(successFn)
			.error(errorFn);
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