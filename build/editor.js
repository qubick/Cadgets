// import Dropzone from 'react-dropzone'

var container, stats;
var camera, controls, scene, renderer;
var objects = [], transformControl;
var originObj, originPoint;
var targetGeometry;

var surfaceClickableTargets = [];
var loder, projector, mouse = { x:0, y:0 };

const CLEARANCE = 5;
init();
animate();


function init() {

  // get type of gear and create UI according to it
  createPanel(); //load basic UI

  loader = new THREE.STLLoader();
  projector = new THREE.Projector();


  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 500;

  scene = new THREE.Scene();
  scene.add( new THREE.AmbientLight( 0x505050 ) );
  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;
  light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
  light.shadow.bias = - 0.00022;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  scene.add( light );


  var grid = new THREE.GridHelper( 1000, 100, 0x888888, 0xcccccc );
  grid.position.set(0, -100, 0);
  scene.add( grid );


  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild( renderer.domElement );

  controls = new THREE.TrackballControls( camera, renderer.domElement );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  transformControl = new THREE.TransformControls( camera, renderer.domElement );
  scene.add(transformControl)

  var changed = false;

  controls.addEventListener( 'change', function() {
    // moved = true;
  } );

  // window.addEventListener( 'mousedown', onDocumentMouseDown, false );
  // document.addEventListener( 'mousedown', onDocumentMouseDown, false );

  window.addEventListener( 'mouseup', function() {

  });

  //geometry operation
  var materialNormal = new THREE.MeshNormalMaterial();


  var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
  dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
  dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );

  stats = new Stats();
  container.appendChild( stats.dom );

  window.addEventListener( 'resize', onWindowResize, false );

} //end of init()

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function ReturnThingNo(evt){
    thingNumber = evt.target.value;
    console.log("thingNumber: ", thingNumber)
}

function ReturnAugmentationTrueFalse(evt){
    if(parseInt(evt.target.value) === 1){
        augmentationTrueFalse = "true"
    }
    else{
        augmentationTrueFalse = "false"
    }
}
function ReturnTypeOfAugmentation(evt){
    augmentationType = parseInt(evt.target.value);

    switch (augmentationType) {
      case 1:
        augmentationType = "stand"
        break;
      case 2:
        augmentationType = "cover"
        break;
      case 3:
          augmentationType = "mount"
        break;
      case 4:
          augmentationType = "handle"
        break;
      case 5:
          augmentationType = "adapter"
        break;
      case 6:
          augmentationType = "holder"
        break;
      case 7:
          augmentationType = "hanger"
        break;
      case 8:
          augmentationType = "loops"
        break
      case 9:
          augmentationType = "else"
        break;

      default:

    }
}

// see if all event could be handled out of this editor where three.js objects initiated
function ReturnTargetObjectAugmenting(evt){

  selectedTargetCategory = parseInt(evt.target.value);


  var newDiv = document.createElement('div');

  switch (selectedTargetCategory) {
    case 1: // can and bottle
      // newDiv.id = "bottles";
      augmentingTargetObj = "can and bottles"
      break;
    case 2: // long and thin objects
      // newDiv.id = "longobj";
      augmentingTargetObj = "long and thin objects"
      break;
    case 3:
        augmentingTargetObj = "flat objects"
        break;
    case 4:
        augmentingTargetObj = "phones and tablets"
      break;
    case 5:
        augmentingTargetObj = "rolls"
      break;
    case 6:
        augmentingTargetObj = "electronics"
      break;
    case 7:
        augmentingTargetObj = "cables"
      break;
    case 8:
        augmentingTargetObj = "loops"
      break;
    case 9:
        augmentingTargetObj = "cylinder and sphere"
      break;
    case 10:
        augmentingTargetObj = "else"
        break;
    default:

  }

  /////******* currently disabled to load low-level categories for simple labeling
  // document.getElementById('searchTarget').appendChild(newDiv);
  //
  // $('#bottles').ddslick({
  //   data: bottle_cans,
  //   width: 300,
  //   selectText: "Select target object",
  //   imagePosition: "right",
  //   onSelected: function(evt){
  //     //evt is value
  //     LoadaugmentingObjectAugmented(evt.selectedData);
  //   }
  // });
  //
  // $('#longobj').ddslick({
  //   data: long_thin,
  //   width: 300,
  //   selectText: "Select target object",
  //   imagePosition: "right",
  //   onSelected: function(event){}
  // });
}


function AddConstraints(constraintsType, targetName) {

  var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 1, wireframe: true } );
  var augmentingObj, buffer //buffer geometry

   if(constraintsType === "diameter"){
     augmentingObj = scene.getObjectByName(targetName);
     var radius = (augmentingObj.geometry.boundingBox.max.x - augmentingObj.geometry.boundingBox.min.x) / 2 + CLEARANCE;

     var geometry = new THREE.CylinderGeometry( radius, radius, 20, 32 );
     buffer = new THREE.Mesh(geometry, wireframeMaterial)

   }
   else if (constraintsType === "height"){

   }
   // console.log("see targetGeometry: ", targetGeometry)
   buffer.position.set(targetGeometry.position.x, plane.position.y, targetGeometry.position.z);

   // augmentingObj.add( buffer ); //the buffer should be added to the object
   scene.add( buffer );

   panel.add(settings, 'errorRange', -1, 5, 0.1).onChange(function(){
     buffer.scale.set(settings.errorRange, 1, settings.errorRange);
   });
}

function LoadaugmentingObjectAugmented(selectedTarget) {

  var stlPath = selectedTarget.stl;
  material.transparent = true

  loader.load( stlPath, ( geometry ) => {
    geometry.center();

    targetGeometry = new THREE.Mesh( geometry, faceColorMaterial);
    targetGeometry.rotation.set(-Math.PI/2, 0, 0);
    targetGeometry.name = selectedTarget.name;
    //recover face informations
    targetGeometry.geometry = new THREE.Geometry().fromBufferGeometry(targetGeometry.geometry);
    targetGeometry.geometry.computeFaceNormals();


    for ( var i = 0; i < targetGeometry.geometry.faces.length; i++ )
    {
      face = targetGeometry.geometry.faces[ i ];
      face.color.setRGB( 0, 0, 0.8 * Math.random() + 0.2);
    }

    scene.add(targetGeometry);
    // objects.push(targetGeometry);
    transformControl.attach(targetGeometry);
    surfaceClickableTargets.push(targetGeometry);

    // get rid of planes for now
    // scene.add(plane);
    // transformControl.attach(plane);


    //once loaded target object, add constraints
    panel.add(params, 'addConst').name('Add Constraints');

    var currPlaneHeight = plane.position.y;

    panel.add(settings, 'movePlane', targetGeometry.geometry.boundingBox.min.y, targetGeometry.geometry.boundingBox.max.y, 0.1).onChange(function(){
      plane.position.set(0, settings.movePlane, 0);
    });
  }); //end of load stl

}

function removeEntity(object){
  var selectObject= scene.getObjectByName(object.name);
  scene.remove( selectObject );

  animate();
}

function animate() {
  requestAnimationFrame( animate );

  render();
  stats.update();
}

function render() {

  update();
  controls.update();
  renderer.render( scene, camera );
}


function update() {

}
