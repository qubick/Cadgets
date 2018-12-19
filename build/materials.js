var material = new THREE.MeshPhongMaterial(
  { color: 0xA9A9A9, specular: 0x111111, shininess: 200, opacity:0.5 } );

var faceColorMaterial = new THREE.MeshBasicMaterial(
  { color: 0xffffff, vertexColors: THREE.FaceColors, opacity:0.5 } );

var faceColorMaterial2 = new THREE.MeshPhongMaterial(
  { color: 0xBDC3C7, vertexColors: THREE.FaceColors, shininess: 200, opacity:0.5 } );
