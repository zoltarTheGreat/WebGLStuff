var Injection = function() {
	this.config = null;
	this.model_properties = null;
	this.scene = null;
	this.renderer = null;
	this.light = null;
	this.model = null;
	this.camera = null;
	this.controls = null;
}

//Sets up all config into the canvas
Injection.prototype.init = function(config) {
	this.config = config;

	// Scene initialization
	this.scene = new THREE.Scene();

	// Renderer setup
	this.renderer = new THREE.WebGLRenderer({antialias: config.antialias});
	this.refreshRenderer();
	
	//Canvas setup
	var webGLContainer = document.getElementById("webgl-container");
	webGLContainer.appendChild(this.renderer.domElement);

	//Light
	this.refreshLight();

	//Model
	this.refreshModel();

	//Camera
	this.camera = new THREE.PerspectiveCamera(45, CANVAS_RATIO, 0.1, 2000);
	this.camera.position.set(config.camera_x, config.camera_y, config.camera_z);
	this.scene.add(this.camera);

	//Orbit controls
	this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
}

//Animation loop
Injection.prototype.animate = function() {
	requestAnimationFrame(injection.animate);
	injection.renderer.render(injection.scene, injection.camera);
	injection.controls.update();
}

//Color and size set to webGL canvas
Injection.prototype.refreshRenderer = function() {
	this.renderer.setSize(this.config.canvas_width, this.config.canvas_height);
	this.renderer.setClearColor(this.config.clear_color);
}

//Light set up
Injection.prototype.refreshLight = function() {
	this.scene.remove(this.light);

	this.light = new THREE.PointLight(this.config.light_color);
	this.light.position.set(this.config.light_x, this.config.light_y, this.config.light_z);

	this.scene.add(this.light);
}

//Refreshes model when different model is selected
Injection.prototype.refreshModel = function() {
	this.scene.remove(this.model);

	var loader = new THREE.OBJLoader();
	loader.load(this.config.model_path, function(geometry) {
		injection._loadModel(geometry);
	});

	injection._analyzeModel();
}

//Loads model to be analyzed
Injection.prototype._loadModel = function(geometry) {
	this.model = geometry;
	this.scene.add(geometry);

	this.refreshMaterial();
}

//This funtion calculates all of the mesh properties and geometric numbers
Injection.prototype._analyzeModel = function() {
	var request = new XMLHttpRequest();
	request.open('GET', this.config.model_path, false);
	request.send();
	var objString = request.responseText;

	var mesh = new Mesh(objString);
	var dcel = new DoublyConnectedEdgeList();
	for (var i = 0; i < mesh.vertices.length; i += 3) {
		dcel.addVertex(mesh.vertices.slice(i,i+3));
	}

	for (var i = 0; i < mesh.indices.length; i += 3) {
		var verts = [];
		for (var j = 0; j < 3; j++) {
			verts.push(mesh.indices[i+j]);
		}
		dcel.addFace(verts);
	}

	function edgeToVector(edge) {
		var u = edge.vert.coords;
		var v = edge.pair.vert.coords;
		var coords = [];

		for (var i = 0; i < u.length; i++) {
			coords.push(u[i] - v[i]);
		}

		return coords;
	}

	function vertexEdgesAsVectors(vertex) {
		var vectors = [];

		var edge_start = vertex.edge;
		vectors.push(edgeToVector(edge_start));
		var edge = edge_start.pair.next;
		while (edge != edge_start) {
			vectors.push(edgeToVector(edge));
			edge = edge.pair.next;
		}
		
		return vectors;
	}

	function vectorLength(vector) {
		var length = 0;

		for (var i = 0; i < vector.length; i++) {
			length += Math.pow(vector[i],2);
		}

		return Math.sqrt(length);
	}

	function dotProd(vector1, vector2) {
		var prod = 0;
		
		for (var i = 0; i < vector1.length; i++) {
			prod += vector1[i]*vector2[i];
		}

		return prod;
	}

	function angleBetweenVectors(vector1, vector2) {
		var length1 = vectorLength(vector1);
		var length2 = vectorLength(vector2);
		var dot = dotProd(vector1, vector2);

		return Math.acos(dot/(length1*length2));
	}

	function calcAngleSums(vertex) {
		var vectors = vertexEdgesAsVectors(vertex);
		var sum = 0;
		for (var i = 0; i < vectors.length; i++) {
			var u = vectors[i];
			var v = vectors[(i+1) % vectors.length];
			sum += angleBetweenVectors(u,v);
		}
		return sum;
	}

	var angleSums = 0;
	dcel.vertices.forEach(function(vertex) {
		angleSums += calcAngleSums(vertex);
	});

	var count = {
		faces: dcel.faces.length,
		edges: dcel.halfedges.length/2,
		vertices: dcel.vertices.length
	}

	var geometry = {
		eulerNumber: count.faces + count.vertices - count.edges,
		genus: 1 - (count.faces + count.vertices - count.edges) / 2,
		gaussianCurvature: (2 * Math.PI * count.vertices - angleSums).toFixed(4)
	}

	if (!this.model_properties) {
		this.model_properties = new ModelProperties();
		this.model_properties.count = count;
		this.model_properties.geometry = geometry;
	} else {
		this.model_properties.count.faces = count.faces;
		this.model_properties.count.edges = count.edges;
		this.model_properties.count.vertices = count.vertices;
		this.model_properties.geometry.eulerNumber = geometry.eulerNumber;
		this.model_properties.geometry.genus = geometry.genus;
		this.model_properties.geometry.gaussianCurvature = geometry.gaussianCurvature;
	}
}

//Funtion to recenter camera
Injection.prototype.autoAdjustCamera = function() {
	var fov = this.camera.fov * (Math.PI/180);
	var zoomFactor = 0.75;
	var boxSize = new THREE.Box3().setFromObject(this.model).getSize();
	var width = boxSize.x;
	var height = boxSize.y;
	var maxD = Math.max(width, height);

	var x = this.model.position.x;
	var y = this.model.position.y;
	var z = this.model.position.z + zoomFactor * Math.abs(maxD / Math.sin(fov/2));

	this.camera.up = new THREE.Vector3(0, 1, 0);
	this.camera.lookAt(new THREE.Vector3(x, y, this.model.position.x));
	this.camera.position.set(x, y, z);
}

//Canvas configuration. Holds all data for colors, size, etc.
var Config = function() {
	//Default canvas size
	this.canvas_width = 800;
	this.canvas_height = 800;
	this.canvas_ratio = (this.canvas_width / this.canvas_height);

	//Default background color
	this.antialias = true;
	this.clear_color = 0x3F3347;
	
	//Default model
	this.model_dir = 'models';
	this.model_name = 'horse.obj';
	this.model_path = this.model_dir + '/' + this.model_name;

	//Default material
	this.material_type = 'phong';
	this.material_color = 0x5563B6;

	//Default light position
	this.light_x = -100;
	this.light_y = 200;
	this.light_z = 100;
	this.light_color = 0xFFFFFF;

	//Default camerta position
	this.camera_x = 0;
	this.camera_y = 0;
	this.camera_z = 250;
}

//Mesh properties and calculation of gemotric numbers
var ModelProperties = function() {
	var count = {
		faces: null,
		edges: null,
		vertices: null
	}
	var geometry = {
		eulerNumber: null,
		genus: null,
		gaussianCurvature: null
	}
}
