var vertexShaderText =
[
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "",
  "void main()",
  "{",
  " fragColor = vertColor;",
  " gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}"
].join("\n");

var fragmentShaderText =
[
  "precision mediump float;",
  "",
  "varying vec3 fragColor;",
  "void main()",
  "{",
  " gl_FragColor = vec4(fragColor, 1.0);",
  "}"
].join("\n");
var Spinning = function () {
  console.log("This is working?");

  var canvas = document.getElementById("triangle");
  var gl = canvas.getContext('webgl');

  if(!gl){
    console.log("Using explerimental webGL");
    gl = canvas.getContext("experimental-webgl");
  }

  if(!gl){
    alet("Your browser doesnt supprt any webgl");
  }

  gl.clearColor(0.75, 0.85, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error;("ERROR compiling vertex shader",
    gl.getShaderInfoLog(vertexShader));
    return;
  }
  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error("ERROR compiling fragmentShader shader",
    gl.getShaderInfoLog(fragmentShader));
    return;
  }

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
    console.error("ERROR validataing program", gl.getProgramInfoLog(program));
    return;
  }

  //BUFFER
  var trianglePoints =
  [ // X,  Y,  Z        R,  G,  B
    0.0, 0.5, 0.0,     1.0, 0.0, 0.0,
    -0.5,-0.5, 0.0,    0.0, 1.0, 0.0,
    0.5, -0.5, 0.0,     0.0, 0.0, 1.0
  ];

  var trianglePointBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePointBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglePoints),
     gl.STATIC_DRAW);

  var positionLocation = gl.getAttribLocation(program, "vertPosition");
  var colorLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionLocation, //index
    3, //size
    gl.FLOAT, //types
    gl.FALSE, //noramlized?
    6 * Float32Array.BYTES_PER_ELEMENT, //chunk size (stride)
    0 //pointer to attribute
  );

  gl.vertexAttribPointer(
    colorLocation, //index
    3, //size
    gl.FLOAT, //types
    gl.FALSE, //noramlized?
    6 * Float32Array.BYTES_PER_ELEMENT, //chunk size (stride)
    3 * Float32Array.BYTES_PER_ELEMENT //pointer to attribute
  );

  gl.enableVertexAttribArray(positionLocation);
  gl.enableVertexAttribArray(colorLocation);

  //Link program first
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.identity(viewMatrix);
  mat4.identity(projMatrix);
  // , glMatrix.toRadian(25),
  //  canvas.width / canvas.height, 0.1, 1000.0

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  //Render loop for rotation
  var angle = 0;
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var axis = new Float32Array(3);
  var randomAxis = Math.floor(Math.random() * 3);
  if (randomAxis == 0) {
    axis = [1,0,0];
  } else if(randomAxis == 1){
    axis = [0,1,0];
  } else {
    axis = [0,0,1];
  }
  var loop = function() {
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(worldMatrix, identityMatrix, angle, axis);
    gl.uniformMatrix4fv(matWorldUniformLocation,gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.5, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
