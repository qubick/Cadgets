//should be global

var modelLoaded = false;
var settings = {
  modelScale: 1.0,
  errorRange: 1.0,
  targetHeight: 1.0,
  movePlane: 1.0,
}



var panel = new dat.GUI();

var params = {
  loadFile: function(){
    document.getElementById('fileInput').click();
    document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
  },
  addConst: function(){
    //cut in plane
    cutInPlaneToGet2DVectors();
    AddConstraints("diameter", targetGeometry.name);
  },
  export: function(){
    console.log("export stl")
  }
}
// var modelUI = panel.addFolder( 'Model Scale' );

//this is to load augmenting objects
function handleFileSelect(evt){
  var files = evt.target.files;
  let targetSTLFile = './assets/' + files[0].name;

  loader.load( targetSTLFile, ( geometry ) => {
    geometry.center()
    var material = new THREE.MeshPhongMaterial( { color: 0x66ffb3, specular: 0x111111, shininess: 200, opacity:0.0 } );
    var targetObj = new THREE.Mesh( geometry, faceColorMaterial );

    targetObj.rotation.set(0, 0, -Math.PI/2);
    targetObj.name = "test_name";
    targetObj.geometry = new THREE.Geometry().fromBufferGeometry(targetObj.geometry);
    targetObj.geometry.computeFaceNormals();

    console.log("see selected face index and face normals: ", targetObj.geometry);

    for ( var i = 0; i < targetObj.geometry.faces.length; i++ )
    {
      face = targetObj.geometry.faces[ i ];
      face.color.setRGB( 0, 0, 0.8 *Math.random() + 0.2);
    }

    //add to the scene and controller lists
    scene.add(targetObj);
    objects.push(targetObj);
    transformControl.attach(targetObj);
    surfaceClickableTargets.push(targetObj);

    panel.add(settings, 'modelScale', -1, 5, 0.1).onChange(function(){
      targetObj.scale.set(settings.modelScale, settings.modelScale, settings.modelScale);
    });

    panel.add(params, 'export').name('Export Model');

  });
}

function createPanel(){

  // panel.add(params, 'loadFile').name('Load 3D Model');

}


function removePanel(gearType){
  topBoxUI.close();
  delete topBoxUI;
}

function showDiv() {
  // document.getElementById('bbox_shape').style.display = "block";
  // document.getElementById('loadSTL').style.display = "block";
  // document.getElementById('model_rotation').style.display = "block";
}
