var DoublyConnectedEdgeList = function() {
	this.halfedges = [];
	this.vertices = [];
	this.faces = [];
	this.heMap = new Object();
}

DoublyConnectedEdgeList.prototype.addVertex = function(vertex) {
	var v = new _Vert();
	v.coords = vertex;
	v.edge = null;
	this.vertices.push(v);
}

DoublyConnectedEdgeList.prototype.addFace = function(faceVerts) {
	var f = new _Face();

	for (var i = 0; i < 3; i++) {
		var uIdx = faceVerts[i];
		var vIdx = faceVerts[(i+1)%3];
		var u = this.vertices[uIdx];
		var v = this.vertices[vIdx];

		var key = uIdx + "," + vIdx;

		this.heMap[key] = new _Edge();
		this.heMap[key].face = f;
		this.heMap[key].vert = v;
		u.edge = this.heMap[key];

		this.halfedges.push(this.heMap[key]);

		if (i == 0) {
			f.edge = this.heMap[key];
		}
	}

	this.faces.push(f);

	for (var i = 0; i < 3; i++) {
		var uIdx = faceVerts[i];
		var vIdx = faceVerts[(i+1)%3];
		var wIdx = faceVerts[(i+2)%3];

		var key1 = uIdx + "," + vIdx; // Curr half-edge
		var key2 = vIdx + "," + wIdx; // Next half-edge
		var key3 = vIdx + "," + uIdx; // Opposite half-edge

		this.heMap[key1].next = this.heMap[key2];
		if (this.heMap[key3]) {
			this.heMap[key1].pair = this.heMap[key3];
			this.heMap[key3].pair = this.heMap[key1];
		}
	}
}

var _Edge = function() {
	this.vert = null;
	this.pair = null;
	this.face = null;
	this.next = null;
}

var _Vert = function() {
	this.coords = null;
	this.edge = null;
}

var _Face = function() {
	this.edge = null;
}
