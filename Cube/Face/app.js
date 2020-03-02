var vertexShaderText =
[
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec2 vertTextC;",
  "varying vec2 fragTextC;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "",
  "void main()",
  "{",
  " fragTextC = vertTextC;",
  " gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}"
].join("\n");

var fragmentShaderText =
[
  "precision mediump float;",
  "",
  "varying vec2 fragTextC;",
  "uniform sampler2D sampler;",
  "",
  "void main()",
  "{",
  " gl_FragColor = texture2D(sampler, fragTextC);",
  "}"
].join("\n");


var Cube = function () {
  console.log("This is working?");

  var canvas = document.getElementById("cube");
  var gl = canvas.getContext('webgl');

  if(!gl){
    console.log("Using explerimental webGL");
    gl = canvas.getContext("experimental-webgl");
  }

  if(!gl){
    alet("Your browser doesnt supprt any webgl");
  }

  gl.clearColor(1.0, 0.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  //Creating Shaders
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
  var cubePoints =
  [ // X,  Y,  Z       U , V
    // Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   1, 0,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		// Right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		// Front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
  ];

  var cubeIndices =
  [
    	// Top
  		0, 1, 2,
  		0, 2, 3,

  		// Left
  		5, 4, 6,
  		6, 4, 7,

  		// Right
  		8, 9, 10,
  		8, 10, 11,

  		// Front
  		13, 12, 14,
  		15, 14, 12,

  		// Back
  		16, 17, 18,
  		16, 18, 19,

  		// Bottom
  		21, 20, 22,
  		22, 20, 23
  ];

  var cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubePoints),
     gl.STATIC_DRAW);

  var cubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices),
   gl.STATIC_DRAW);


  var positionLocation = gl.getAttribLocation(program, "vertPosition");
  var textCLocation = gl.getAttribLocation(program, "vertTextC");
  gl.vertexAttribPointer(
    positionLocation, //index
    3, //size
    gl.FLOAT, //types
    gl.FALSE, //noramlized?
    5 * Float32Array.BYTES_PER_ELEMENT, //chunk size (stride)
    0 //pointer to attribute
  );

  gl.vertexAttribPointer(
    textCLocation, //index
    2, //size
    gl.FLOAT, //types
    gl.FALSE, //noramlized?
    5 * Float32Array.BYTES_PER_ELEMENT, //chunk size (stride)
    3 * Float32Array.BYTES_PER_ELEMENT //pointer to attribute
  );

  gl.enableVertexAttribArray(positionLocation);
  gl.enableVertexAttribArray(textCLocation);
  
  //Creating texture
  var faceTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, faceTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById("cubeSkin")
  );

  gl.bindTexture(gl.TEXTURE_2D, null);


  

  //Link program first
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45),
   canvas.width / canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  var firstRotation = new Float32Array(16);
  var secondRotation = new Float32Array(16);

  //Render loop for rotation
  var angle = 0;
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);

  var loop = function() {
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation,gl.FALSE, worldMatrix);

    gl.clearColor(1.0, 0.0, 1.0, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
    gl.bindTexture(gl.TEXTURE_2D, faceTexture);
    gl.activeTexture(gl.TEXTURE0);

    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
