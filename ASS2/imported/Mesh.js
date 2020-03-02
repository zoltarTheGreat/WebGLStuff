function Mesh(objString) {
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.indices = [];

  this.fromObjString(objString);
}

function _Mesh_Unpacked() {
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.hashindices = {};
  this.indices = [];
  this.index = 0;
}

_Mesh_Unpacked.prototype.unpackVertex = function(vertex) {
  this.vertices.push(+vertex[0]);
  this.vertices.push(+vertex[1]);
  this.vertices.push(+vertex[2]);
}

_Mesh_Unpacked.prototype.unpackNormal = function(normal) {
  this.normals.push(+normal[0]);
  this.normals.push(+normal[1]);
  this.normals.push(+normal[2]);
}

_Mesh_Unpacked.prototype.unpackTexCoord = function(texCoord) {
  this.texCoords.push(+texCoord[0]);
  this.texCoords.push(+texCoord[1]);
}

function _Mesh_ObjFile() {
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
}

_Mesh_ObjFile.prototype.pushVertex = function(vertex) {
  this.vertices.push.apply(this.vertices, vertex);
}

_Mesh_ObjFile.prototype.pushNormal = function(normal) {
  this.normals.push.apply(this.normals, normal);
}

_Mesh_ObjFile.prototype.pushTexCoord = function(texCoord) {
  this.texCoords.push.apply(this.texCoords, texCoord);
}

Mesh.prototype.fromObjString = function(objString) {
  var objFile = new _Mesh_ObjFile();
  var unpacked = new _Mesh_Unpacked();

  var lines = objString.split('\n');

  var VERTEX_REG = /^v\s/;
  var NORMAL_REG = /^vn\s/;
  var TEXTURE_REG = /^vt\s/;
  var FACE_REG = /^f\s/;
  var WHITESPACE_REG = /\s+/;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var elements = line.split(WHITESPACE_REG);
    elements.shift();

    if (VERTEX_REG.test(line)) {
      objFile.pushVertex(elements);
    } else if (NORMAL_REG.test(line)) {
      objFile.pushNormal(elements);
    } else if (TEXTURE_REG.test(line)) {
      objFile.pushTexCoord(elements);
    } else if (FACE_REG.test(line)) {
      var quad = false;
      for (var j = 0, eleLen = elements.length; j < eleLen; j++) {
        if (j == 3 && !quad) {
          j = 2;
          quad = true;
        }

        if (elements[j] in unpacked.hashindices) {
          unpacked.indices.push(unpacked.hashindices[elements[j]]);
        } else {
          var vertex = elements[j].split('/');

          var vertexIdx = (vertex[0] - 1) * 3;
          var vertex = objFile.vertices.slice(vertexIdx,vertexIdx+3);
          unpacked.unpackVertex(vertex);

          if (objFile.texCoords.length) {
            var texCoordIdx = (vertex[1] - 1) * 2;
            var texCoord = objFile.texCoords.slice(texCoordIdx, texCoordIdx+2);
            unpacked.unpackTexCoord(texCoord);
          }

          var normIdx = (vertex[2] - 1) * 3;
          var normal = objFile.normals.slice(normIdx, normIdx+3);
          unpacked.unpackNormal(normal);
          
          unpacked.hashindices[elements[j]] = unpacked.index;
          unpacked.indices.push(unpacked.index);
          unpacked.index += 1;
        }

        if (j == 3 && quad) {
          unpacked.indices.push(unpacked.hashindices[elements[0]]);
        }
      }
    }
  }

  this.vertices = unpacked.vertices;
  this.normals = unpacked.normals;
  this.texCoords = unpacked.texCoords;
  this.indices = unpacked.indices;
}