/*
* This js file is used to display any of the selected obj files from the
* that where converted into JSON files.
*/

var scene, camera, renderer, mesh;
var chosen = "";

//Calling Functions
chosen = input();     //Collects input from the href query
init(chosen);      //Initiates all meshes, materials, cameras, lights, etc.
animate();  //Animation loop.



function input()  {
  //Getting input via href for object chosen
  var href = window.location.href;
  //Variable to store what the chosen js file was
  var chosen = "";
  var i = 0;
  //Scrolls past all the regular href until the "#"
  do{
    i++;
  }while (href[i] != undefined && href[i] != "#");

  i++;    //Skips the "#"
  if(href[i] == undefined){
    return undefined;
  }

  //Collects the information after the "#"
  do{
      chosen += href[i];
      i++;
  }while (href[i] != undefined);

  return chosen;
  }






/*
* Input:
* objectChosen : The JSON file to be rendered.
* Output:
* Rotating demo of the rendered JSON file with orbiting controls of the camera.
*/
function init(objectChosen)  {

  //Validating input
  var objLoaded = undefined;
  //Horse is default loaded object
  if(objectChosen == undefined){
    objLoaded = "horse";
  }else {
    objLoaded = objectChosen;
  }

  //Confirming what object was loaded
  console.log(objLoaded);

  //Creating scene and setting size
  scene = new THREE.Scene();
  var WIDTH = window.innerWidth * 0.75,
  HEIGHT = window.innerWidth * 0.75;

  //Creates renderer
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);

  //Adding Camera
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(3,3,3);
  scene.add(camera);

  //Listener for window resize
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth * 0.75,
    HEIGHT = window.innerHeight * 0.75;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  //Background Color
  renderer.setClearColor(0x333F47, 1);

  //Let there be light
  var light = new THREE.PointLight( 0xffffff, 1, 0 );
  light.position.set(50,50,50);
  scene.add( light );

  //Loads the mesh into the scene
  var loader = new THREE.JSONLoader();
  loader.load( "models/jsConverted/" + objLoaded + ".js",
  function(geometry){
    var material = new THREE.MeshPhongMaterial({color: 0xFFD700,
      shininess: 60,
      reflectivity: 60});
    mesh = new THREE.Mesh(geometry, material);

    //Mesh is scaled to appear uniform for every model.
    if(objLoaded == "hand"){
      mesh.scale.set(0.005, 0.005, 0.005);
    }else if (objLoaded == "sculpture") {
      mesh.scale.set(0.0025, 0.0025, 0.0025);
    }else if (objLoaded == "topology") {
      mesh.scale.set(0.025, 0.025, 0.025);
    }else if (objLoaded == "torus") {
      mesh.scale.set(0.5, 0.5, 0.5);
    }else if (objLoaded == "horse") {
      mesh.scale.set(5, 5, 5);
    }

    scene.add(mesh);
  });

  //Adds orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

}


/*
* Input : Nothing
* Output : Animation loop of scene.
*/
function animate() {
    //Stantdard animation frame request.
    requestAnimationFrame(animate);

    //Rotating the chosen mesh.
    mesh.rotation.y += 0.05;
    //Renders
    renderer.render(scene, camera);
    controls.update();
}
