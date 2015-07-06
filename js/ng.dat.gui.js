//Integrates dat.GUI with angular forms to allow regular 
//browser based form controls to interface with dat.GUI


//TODO
// 1. Get programmatic access to all dat.GUI controls once they are loaded
// 2. Give angular controller access to scope in (1) and cr8 two way binding
// 3. Generate Form Controls w/ directives
// 4. Make it so all dev has to do is include ng.dat.gui.js to bind angular form ctrl to
// 	  dat.gui

var main_app = angular.module("main_app", []);

main_app.controller("ngDatGuiCtrl", ['$scope', '$compile', function($scope, $compile){
	function link() {
		console.log("Initializing Controller...");

		document.addEventListener("datGUILoaded", function(e) {
			var gui = e.detail.gui;
			$scope.gui = gui;

			console.log(gui);
			//Loop Through All Root Controls
			for(var i = 0; i < gui.__controllers.length; i++) {
				var controller = gui.__controllers[i];
				//console.log(controller);

				//Add speed controller to angular model
				angular.element(controller.domElement).find("input").attr("ng-model", controller.property);
				$compile(controller.domElement)($scope);
			}
			//Loop Through All Controls In Each Folder (1 lvl deep, make deeper later)
			for(var folder in gui.__folders) {
				var controllers = gui.__folders[folder].__controllers;
				//console.info(controllers);
			}
		});
	};

	$scope.$watch("wireframe", function(newVal, oldVal) {
		console.log("Watching gui..");
		console.log($scope.gui);
		console.log("The new Val:" + newVal);
		if($scope.gui)
			$scope.gui.__controllers[1].setValue(newVal);
	});

	$scope.$watch("speed", function(newVal, oldVal) {
		console.log("Watching gui..");
		console.log($scope.gui);
		console.log("The new Val:" + newVal);
		if($scope.gui)
			$scope.gui.__controllers[0].setValue(newVal);
	});


	return {
		restrict: 'AEC',
		link: link()
	}
}]);