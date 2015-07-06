function ModalController($rootScope, $scope) {

	$scope.showModal = false;
	
	$scope.modalTitle = 'modal title';
	$scope.cancel = 'cancel';
	$scope.onCancel = function() {
		$scope.showModal = false;

		$scope.modalTitle = 'gpxsmaps.net';

		$scope.button1Text = '';
		$scope.onButton1 = function() {};
		
		$scope.button2Text = '';
		$scope.onButton2 = function() {};
	};

	$scope.button1Text = 'one';
	$scope.onButton1 = function() {};

	$scope.button2Text = 'two';
	$scope.onButton2 = function() {};

	$scope.openModal = function() {
		$scope.showModal = true;
	};

	$scope.click1 = function() { 
		$scope.onButton1(); 
		$scope.showModal = false; 
	};
	$scope.click2 = function() { 
		$scope.onButton2();
		$scope.showModal = false; 
	};

	$scope.openUnsavedChangesModal = function(onSave, onDiscard) {
		$scope.modalTitle = 'unsaved changes ';
		$scope.cancel = 'cancel';
		$scope.button1Text = 'save';
		$scope.onButton1 = onSave;
		$scope.button2Text = 'discard';
		$scope.onButton2 = onDiscard;

		$scope.showModal = true;
	};

	$rootScope.$on(Command.OPEN_UNSAVED_CHANGES_MODAL, function(evt, data){
		$scope.openUnsavedChangesModal(data.onSave, data.onDiscard);
	});
}