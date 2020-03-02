// ThreeJS variables
var scene, camera, renderer, controller;
//Canvas Sizes
var CANVAS_WIDTH = 800, CANVAS_HEIGHT = 600,
	CANVAS_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

//Variables for dat gui
var injection, config, gui;

//Execute Script on load
window.onload = start;

function start() {
	injection = new Injection();
	config = new Config();
	injection.init(config);
	injection.animate();

	gui = new dat.GUI();
	initGUI();
}

function initGUI() {
	var c; // controller pointer

	var model_list = {
		Bunny: "bunny.obj",
		Eight: "eight.obj",
		Hand: "hand.obj",
		Horse: "horse.obj",
		Gargoyle: "gargoyle.obj",
		Sculpture: "sculpture.obj",
		Topology: "topology.obj",
		Torus: "torus.obj"
	}

	//Auto Adjust function button
	c = gui.add(injection, 'autoAdjustCamera').name("Auto-Adjust");
	//Model List drop down menu
	c = gui.add(config, 'model_name', model_list).name("Model");
	c.onChange(updateModel);
	

	var propFolder = gui.addFolder('Geometric Properties');
		propFolder.add(injection.model_properties.count, 'faces').name("Faces");
		propFolder.add(injection.model_properties.count, 'edges').name("Edges");
		propFolder.add(injection.model_properties.count, 'vertices').name("Vertices");
		propFolder.add(injection.model_properties.geometry, 'eulerNumber').name("Euler Number");
		propFolder.add(injection.model_properties.geometry, 'genus').name("Genus");
		propFolder.add(injection.model_properties.geometry, 'gaussianCurvature').name("Gaussian Curvature");
}

//Function To recenter view on the model
function updateCameraView() {
	exmaple.autoAdjustCamera();
}

//Refreshing the displayed model when changed
function updateModel(model_name) {
	injection.config.model_name = model_name;
	injection.config.model_path = injection.config.model_dir + "/" + model_name;

	injection.refreshModel();

	gui.__folders['Geometric Properties'].updateDisplay()
}
