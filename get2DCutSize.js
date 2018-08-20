var pointsOfIntersect = new THREE.Geometry(); //it's saving 2D vectors of soft region
var pointOfIntersect = new THREE.Vector3();

var pointMaterial = new THREE.PointsMaterial({
  size:.5,
  color: "green"
});

var planeGeom = new THREE.PlaneGeometry(100, 100);
var mathPlane = new THREE.Plane();

planeGeom.rotateX(-Math.PI / 2);

var plane = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({
  color: "lightgray",
  transparent: true,
  opacity: 0.75,
  side: THREE.DoubleSide
}));

var a = new THREE.Vector3()
  ,b = new THREE.Vector3()
  ,c = new THREE.Vector3();

var planePointA = new THREE.Vector3()
    ,planePointB = new THREE.Vector3()
    ,planePointC = new THREE.Vector3();

var lineAB, lineBC, lineCA;

function cutInPlaneToGet2DVectors(){

  plane.localToWorld(planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
  plane.localToWorld(planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
  plane.localToWorld(planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
  mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);

  targetGeometry.geometry = new THREE.Geometry().fromBufferGeometry(targetGeometry.geometry);
  targetGeometry.geometry.faces.forEach( (face) => {
    targetGeometry.localToWorld(a.copy(targetGeometry.geometry.vertices[face.a]));
    targetGeometry.localToWorld(b.copy(targetGeometry.geometry.vertices[face.b]));
    targetGeometry.localToWorld(c.copy(targetGeometry.geometry.vertices[face.c]));

    // console.log("what's a??", a)
    lineAB = new THREE.Line3(a, b);
    lineBC = new THREE.Line3(b, c);
    lineCA = new THREE.Line3(c, a);

    setPointOfIntersection(lineAB, mathPlane);
    setPointOfIntersection(lineBC, mathPlane);
    setPointOfIntersection(lineCA, mathPlane);
  });


  var points = new THREE.Points(pointsOfIntersect, pointMaterial);
  var lines = new THREE.LineSegments(pointsOfIntersect, new THREE.LineBasicMaterial({
    color: 0xffffff
  }));

  scene.add(points);
  scene.add(points);
}

function setPointOfIntersection(line, plane){

    pointOfIntersect = plane.intersectLine(line);

    if(pointOfIntersect){
      pointsOfIntersect.vertices.push(pointOfIntersect.clone())
    }
}
