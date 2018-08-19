// import Dropzone from 'react-dropzone'

var container, stats;
var camera, controls, scene, renderer;
var objects = [], transformControl;
var originObj, originPoint;

var stlModel;
var selectedGear;

//variables for rotation direction simulator
var newPower, curPower = 'rotary', conflict = false; //should be returned by the first gear
var collisionOccured = false, collidableMeshList = [];
var directionList = [];


var body, arm1, arm2, head;

var gears = [], gearsElement, gearIdx = 0;
//to animate gear mechanisms
var swingDelta = 0.01, camDelta = 0.01,
    crankDelta = 0.15, pulleyDelta = 0.25, sliderDelta = 0.25;

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

  if (curPower != newPower)
    conflict = true; //function to prompt conflict

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
  console.log("selected Action: ", selectedTargetCategory);

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
      console.log("value: ", evt.selectedData);
      // AddConstraints();
      LoadTargetObjectAugmented(evt.selectedData.stl);
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


// function AddConstraints(divname) {
//    var newDiv = document.createElement('div');
//    var html = '<select onchange="ReturnPrimitiveShapeOfAugmented(event)">'
//         +'<option value="0">Select constraints</option>'
//        +'<option value="1">Circle</option>'
//        +'<option value="2">Square</option>'
//        +'<option value="3">Triangle</option>'
//        +'<option value="4">Polyhedron</option>'
//        +'</select>';
//    newDiv.innerHTML= html;
//    document.getElementById(divname).appendChild(newDiv);
// }

function LoadTargetObjectAugmented(stlPath) {

  var material = new THREE.MeshPhongMaterial( { color: 0xA9A9A9, specular: 0x111111, shininess: 200, opacity:0.3 } );
  material.transparent = true
  var targetGeometry;

  console.log(stlPath)
  loader.load( stlPath, ( geometry ) => {
    geometry.center();

    targetGeometry = new THREE.Mesh( geometry, material );
    targetGeometry.rotation.set(-Math.PI/2, 0, Math.PI);

    scene.add(targetGeometry);
    objects.push(targetGeometry);
    transformControl.attach(targetGeometry);

    // panel.add(settings, 'targetDiameter', -1, 5, 0.1).onChange(function(){
    //   targetGeometry.scale.set(settings.targetDiameter, settings.targetDiameter, settings.targetHeight);
    // });
    //
    // panel.add(settings, 'targetHeight', -1, 5, 0.1).onChange(function(){
    //   targetGeometry.scale.set(settings.targetDiameter, settings.targetDiameter, settings.targetHeight);
    // });
  })

}

function ReturnRegionSelection(evt) {

    var caseValue = parseInt(evt.target.value)
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 1, wireframe: true } );
    switch (caseValue) {
      case 1: //sphere

        var geometry = new THREE.SphereGeometry(50, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        var cube = new THREE.Mesh(geometry, material);
        // scene.add( sphere );
        break;
      case 2: //cube
        var geometry = new THREE.BoxGeometry( 50, 50, 50 );
        // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var cube = new THREE.Mesh( geometry, material );
        break;

      case 3: //level

        break;
      default:

    }
    cube.name = "regionVolume";

    scene.add(cube);
    objects.push(cube);

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
