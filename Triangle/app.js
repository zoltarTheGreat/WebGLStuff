var vertexShaderText =
[
  "precision mediump float;",
  "",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "",
  "void main()",
  "{",
  " fragColor = vertColor;",
  " gl_Position = vec4(vertPosition, 0.0, 1.0);",
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
var Demo = function () {
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
  [ // X,Y        R, G, B
    0.0, 0.5,   1.00, 0.98, 0.67,
    -0.5,-0.5,  0.47, 0.73, 0.25,
    0.5, -0.5,  0.65, 0.38, 0.34
  ];

  var trianglePointBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePointBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglePoints),
     gl.STATIC_DRAW);

  var positionLocation = gl.getAttribLocation(program, "vertPosition");
  var colorLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionLocation, //index
    2, //size
    gl.FLOAT, //types
    gl.FALSE, //noramlized?
    5 * Float32Array.BYTES_PER_ELEMENT, //chunk size (stride)
    0 //pointer to attribute
  );

  gl.vertexAttribPointer(
    colorLocation, //index
    3, //size
    gl.FLOAT, //types
    gl.FALSE, //noramlized?
    5 * Float32Array.BYTES_PER_ELEMENT, //chunk size (stride)
    2 * Float32Array.BYTES_PER_ELEMENT //pointer to attribute
  );

  gl.enableVertexAttribArray(positionLocation);
  gl.enableVertexAttribArray(colorLocation);


  //Render loop
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};
