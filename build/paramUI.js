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

    //this is for saving file to user local by file browser
    saveString( JSON.stringify(labelingResults), 'testLabeling.json' );

    //to save file to server automatically
    // writeResAsJSON( JSON.stringify(labelingResults) );
  },
  export: function(){
    console.log("export stl");
  }
}

function writeResAsJSON( data ){

    console.log("logging file to server")
    let filename = "result" //tentative, will fetch real stl file name
    const writefilePath = '../res/' + filename + '.json';
    var xhr = new XMLHttpRequest();

    xhr.open("POST", writefilePath, true);
    xhr.send(data);
    if (xhr.status == 200) {
      var result = xhr.responseText;
  }

  console.log(result)
}

//to save labeling results to user local
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
    const readfilePath = '../assets/thing_list.csv';
    var stlFileList = null;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", readfilePath, false);
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
