// import Dropzone from 'react-dropzone'

var container, stats;
var camera, controls, scene, renderer;
var objects = [];
var originObj, originPoint;

var stlModel;
var selectedGear;

var latestGearRotation = 1, rotationChanged = 0, rotationChangedId; //positive

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

function ReturnDesiredInteraction(event){

  selectedInterAction = parseInt(event.target.value);
  console.log("selected Action: ", selectedInterAction);
  LoadDesiredInteraction(parseInt(selectedInterAction));

  // showDiv();
}

function LoadDesiredInteraction(selectedInterAction) {

  var material = new THREE.MeshPhongMaterial( { color: 0xA9A9A9, specular: 0x111111, shininess: 200, opacity:0.3 } );
  material.transparent = true
  var targetPath, targetGeometry; //foot, finger, body, palm;

  switch(selectedInterAction){
    case 1: //footpress
      targetPath = './assets/left_foot.stl'
      break;
    case 2: //finger pres
      break;
    case 3: //sit
      console.log("sit pose")
      targetPath = './assets/sittingman.stl'
      break;
    case 4: //grash by palm
      targetPath = './assets/palm.stl'
      break;
    case 5: //squeeze by finger
    default:
  }

  console.log(targetPath)
  loader.load( targetPath, ( geometry ) => {
    geometry.center()

    targetGeometry = new THREE.Mesh( geometry, material );
    targetGeometry.rotation.set(-Math.PI/2, 0, Math.PI);
    
    if(selectedInterAction == 3){
      targetGeometry.scale.set(50,50,50);
      // targetGeometry.rotation.set(-Math.PI/2, 0, 0);
    }
    scene.add(targetGeometry);
    objects.push(targetGeometry);
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


  ///////************ this is for CSG operations
  // if(meshToReturn != undefined){
  //   console.log("meshToReturn loaded: ", meshToReturn)
  //
  //   var cube = CSG.cube();
  //   var geometryThree  = THREE.CSG.fromCSG(cube);
  //   scene.add(geometryThree);
  //
  //   // var geomModel = THREE.CSG.toCSG(meshToReturn);
  //   // console.log("geom Model: ", geomModel);
  //

  // console.log(gears[0].topGear);
  // }


  if(gears[1] != undefined){ //at least two boxes for collision detection
    var originObj = gears[0].box;
    var originPoint = originObj.position.clone();

    // console.log(originPoint)
    var emptyMeshList = [];
    var powerList = [];

    for(var i=1; i<gearIdx; i++){
      powerList.push(gears[i].powerType);

      emptyMeshList.push(gears[i].left);
      emptyMeshList.push(gears[i].right);
      if(gears[i].top != undefined)
          emptyMeshList.push(gears[i].top);
    }

    //collision detection
    for (var vertexIndex = 0; vertexIndex < originObj.geometry.vertices.length; vertexIndex++){
  		var localVertex = originObj.geometry.vertices[vertexIndex].clone();
  		var globalVertex = localVertex.applyMatrix4( originObj.matrix );
  		var directionVector = globalVertex.sub( originObj.position );

  		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
  		var collisionResults = ray.intersectObjects( emptyMeshList ); //this should exclude self
  		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
        powerList.forEach((power) => {
            if((power != originObj.powerType) && changed) {//&& (collisionOccured === false)){
  			     window.alert("Gearboxes are not compatible in power direction");
             changed = false;
           }
        })
      }
  	}

  }
}
