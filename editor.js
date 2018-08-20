// import Dropzone from 'react-dropzone'

var container, stats;
var camera, controls, scene, renderer;
var objects = [], transformControl;
var originObj, originPoint;
var targetGeometry;

const CLEARANCE = 5;
init();
animate();

var loader = new THREE.STLLoader();

function init() {

  // get type of gear and create UI according to it
  createPanel(); //load basic UI

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

  window.addEventListener( 'mousedown', function () {
    changed = false;

  }, false );

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
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


// see if all event could be handled out of this editor where three.js objects initiated
function ReturnTargetObjectAugmenting(evt){

  selectedTargetCategory = parseInt(evt.target.value);

  var newDiv = document.createElement('div');

  switch (selectedTargetCategory) {
    case 1: // can and bottle
      newDiv.id = "bottles";
      break;
    case 2: // long and thin objects
      newDiv.id = "longobj";
      break;
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      break;
    default:

  }
  document.getElementById('searchTarget').appendChild(newDiv);

  $('#bottles').ddslick({
    data: bottle_cans,
    width: 300,
    selectText: "Select target object",
    imagePosition: "right",
    onSelected: function(evt){
      //evt is value
      LoadTargetObjectAugmented(evt.selectedData);
    }
  });

  $('#longobj').ddslick({
    data: long_thin,
    width: 300,
    selectText: "Select target object",
    imagePosition: "right",
    onSelected: function(event){}
  });
}


function AddConstraints(constraintsType, targetName) {

  var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 1, wireframe: true } );
  var targetObj, buffer //buffer geometry

   if(constraintsType === "diameter"){
     targetObj = scene.getObjectByName(targetName);
     var radius = (targetObj.geometry.boundingBox.max.x - targetObj.geometry.boundingBox.min.x) / 2 + CLEARANCE;

     var geometry = new THREE.CylinderGeometry( radius, radius, 20, 32 );
     buffer = new THREE.Mesh(geometry, wireframeMaterial)

   }
   // targetObj.add( buffer ); //the buffer should be added to the object
   scene.add( buffer );

   panel.add(settings, 'errorRange', -1, 5, 0.1).onChange(function(){
     buffer.scale.set(settings.errorRange, 1, settings.errorRange);
   });

   panel.add(settings, 'movePlane', -10, 10, 0.1).onChange(function(){
     plane.position.set(0, settings.movePlane, 0);
   });
}

function LoadTargetObjectAugmented(selectedTarget) {

  var stlPath = selectedTarget.stl;
  var material = new THREE.MeshPhongMaterial( { color: 0xA9A9A9, specular: 0x111111, shininess: 200, opacity:0.5 } );
  material.transparent = true

  loader.load( stlPath, ( geometry ) => {
    geometry.center();

    targetGeometry = new THREE.Mesh( geometry, material );
    targetGeometry.rotation.set(-Math.PI/2, 0, 0);
    targetGeometry.name = selectedTarget.name;

    scene.add(targetGeometry);
    objects.push(targetGeometry);
    transformControl.attach(targetGeometry);

    scene.add(plane);
    transformControl.attach(plane);

    //once loaded target object, add constraints
    panel.add(params, 'addConst').name('Add Constraints');

    var currPlaneHeight = plane.position.y;
    panel.add(settings, 'movePlane', -10, 10, 0.1).onChange(function(){
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
