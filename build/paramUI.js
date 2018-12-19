var modelLoaded = false;
var settings = {
  modelScale: 1.0,
  errorRange: 1.0,
  targetHeight: 1.0,
  movePlane: 1.0,
}

//information regarding labeling
var labelingResults = {};
var thingNumber
    ,augmentationFileName
    ,augmentationTrueFalse
    ,augmentationType
    ,augmentingTargetObj;

var augmentingObj;

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
    labelingResults.augmentType     = augmentationType;
    labelingResults.targetobject    = augmentingTargetObj;
    labelingResults.interfaceMeshIdx = selectedMeshList.sort();

    saveString( JSON.stringify(labelingResults), 'testLabeling.json' );
  },
  export: function(){
    console.log("export stl");
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


function save( blob, filename ){
  link.href = URL.createObjectURL( blob );
  link.download = filename;
  link.click();
}

function FileSelectFromServer( evt ){
    const filePath = '../assets/thing_list.csv';
    var stlFileList = null;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status == 200) {
      stlFileList = xhr.responseText;

      var files = stlFileList.split("\n")
      var targetSTLFile = './assets/' + files[0];

      console.log("file: ", targetSTLFile) //always read the first file


      loader.load( targetSTLFile, ( geometry ) => {
        geometry.center()
        augmentingObj = new THREE.Mesh( geometry, faceColorMaterial2 );

        augmentingObj.rotation.set(-Math.PI/2, 0, 0);
        augmentingObj.name = "test_name";
        augmentingObj.geometry = new THREE.Geometry().fromBufferGeometry(augmentingObj.geometry);
        augmentingObj.geometry.computeFaceNormals();

        //add to the scene and controller lists
        augmentingObj.name = 'augmentingObj'
        scene.add(augmentingObj);
        objects.push(augmentingObj);
        transformControl.attach(augmentingObj);
        surfaceClickableTargets.push(augmentingObj);

        panel.add(settings, 'modelScale', -1, 5, 0.1).onChange(function(){
          augmentingObj.scale.set(settings.modelScale, settings.modelScale, settings.modelScale);
        });

        // panel.add(params, 'export').name('Export Model');
        panel.add(params, 'save').name('Save Results');

      });
    }

}


//this is to load augmenting objects from user's choice
function FileSelectFromUserLocal(evt){
  var files = evt.target.files;
  // var targetSTLFile = './assets/' + files[0].name;
  var targetSTLFile = files[0].name;
  augmentationFileName = files[0].name;

  const reader = new FileReader();
  reader.readAsDataURL(evt.target.files[0]); //read .stl file
  reader.onload = (file) => {
      loader.load(file.target.result, ( geometry ) => {
        geometry.center()

        augmentingObj = new THREE.Mesh( geometry, faceColorMaterial2 );

        augmentingObj.rotation.set(-Math.PI/2, 0, 0);
        augmentingObj.name = "test_name";
        augmentingObj.geometry = new THREE.Geometry().fromBufferGeometry(augmentingObj.geometry);
        augmentingObj.geometry.computeFaceNormals();

        //add to the scene and controller lists
        augmentingObj.name = 'augmentingObj'
        scene.add(augmentingObj);
        objects.push(augmentingObj);
        transformControl.attach(augmentingObj);
        surfaceClickableTargets.push(augmentingObj);

        panel.add(settings, 'modelScale', -1, 5, 0.1).onChange(function(){
          augmentingObj.scale.set(settings.modelScale, settings.modelScale, settings.modelScale);
        });

        // panel.add(params, 'export').name('Export Model');
        panel.add(params, 'save').name('Save Results');

      });
  }
}

function createPanel(){
  // panel.add(params, 'loadFile').name('Load 3D Model');

}


function removePanel(gearType){
  topBoxUI.close();
  delete topBoxUI;
}
