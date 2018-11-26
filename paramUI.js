var modelLoaded = false;
var settings = {
  modelScale: 1.0,
  errorRange: 1.0,
  targetHeight: 1.0,
  movePlane: 1.0,
}

//information regarding labeling
var labelingResults = {};
var thingNumber, augmentationFileName, augmentationTrueFalse, augmentingTargetObj;

var augmentingObj;//, augmentingObjLoaded = false;

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
  save :function() {
    console.log("save labeling results");

    labelingResults.fileName        = augmentationFileName;
    labelingResults.thingNo         = thingNumber;
    labelingResults.augmentation    = augmentationTrueFalse;
    labelingResults.targetobject    = augmentingTargetObj;
    labelingResults.interfaceMeshIdx = selectedMeshList.sort();

    saveString( JSON.stringify(labelingResults), 'testLabeling.json' );
  },
  export: function(){
    console.log("export stl")
  }
}
// var modelUI = panel.addFolder( 'Model Scale' );

//to save labeling results
function saveString (text, filename ){
  save ( new Blob( [text], {type: 'text/plain'}), filename );
}

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );


function save (blob, filename){
  link.href = URL.createObjectURL( blob );
  link.download = filename;
  link.click();
}

//this is to load augmenting objects
function handleFileSelect(evt){
  var files = evt.target.files;
  var targetSTLFile = './assets/' + files[0].name;
  // var targetSTLFile = files[0].name;
  augmentationFileName = files[0].name;


  loader.load( targetSTLFile, ( geometry ) => {
    geometry.center()
    // var material = new THREE.MeshPhongMaterial( { color: 0x66ffb3, specular: 0x111111, shininess: 200, opacity:0.0 } );
    augmentingObj = new THREE.Mesh( geometry, faceColorMaterial );

    augmentingObj.rotation.set(-Math.PI/2, 0, 0);
    augmentingObj.name = "test_name";
    augmentingObj.geometry = new THREE.Geometry().fromBufferGeometry(augmentingObj.geometry);
    augmentingObj.geometry.computeFaceNormals();


    for ( var i = 0; i < augmentingObj.geometry.faces.length; i++ )
    {
      face = augmentingObj.geometry.faces[ i ];
      face.color.setRGB( 0, 0.8 *Math.random() + 0.2, 0);
    }

    //add to the scene and controller lists
    augmentingObj.name = 'augmentingObj'
    scene.add(augmentingObj);
    // objects.push(augmentingObj);
    transformControl.attach(augmentingObj);
    surfaceClickableTargets.push(augmentingObj);

    panel.add(settings, 'modelScale', -1, 5, 0.1).onChange(function(){
      augmentingObj.scale.set(settings.modelScale, settings.modelScale, settings.modelScale);
    });

    // panel.add(params, 'export').name('Export Model');
    panel.add(params, 'save').name('Save Results');

  });
}

function createPanel(){
  // panel.add(params, 'loadFile').name('Load 3D Model');

}


function removePanel(gearType){
  topBoxUI.close();
  delete topBoxUI;
}
