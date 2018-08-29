
$(document).click( (event) => {
    // var text = $(event.target).text();
    // console.log(text);
    // console.log(event.target)

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //find intersection with the raycaster
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub(camera.position).normalize() );

    //create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects( surfaceClickableTargets );
    var selectedNormal, selectedFaceIdx, cnt = 0;

    if( intersects.length > 0){
      console.log("Hit @ ", intersects[0]);
      console.log("selected face point: ", intersects[0].point)


      plane.position.set(0, intersects[0].point.y, 0);
      scene.add(plane);
      var obj = scene.getObjectByName('augmentingObj');
      if(obj && targetGeometry){
        obj.position.set(0, intersects[0].point.y, 0);
      }
      // cutInPlaneToGet2DVectors();

      //change the color of the closest face
      intersects[0].face.color.setRGB(0.8 * Math.random() + 0.2, 0, 0);
      intersects[0].object.geometry.colorsNeedUpdate = true;
      selectedNormal = intersects[0].face.normal;
      selectedFaceIdx = intersects[0].faceIndex;

      console.log("intersect face index: ", selectedFaceIdx);
      //select all objects with same normal;
      var newFaces = intersects[0].object.geometry.faces; //faces of object with selected triangle

      newFaces.forEach( (it, i) => {
        if(Math.abs(it.normal.x - selectedNormal.x) < 0.4){
          if(Math.abs(it.normal.y - selectedNormal.y) < 0.4){
            if(Math.abs(it.normal.z - selectedNormal.z) < 0.4){
              if( Math.abs(i - selectedFaceIdx) < 200 ) {
                cnt += 1;
                it.color.setRGB(1, 0, 0);
                intersects[0].object.geometry.colorsNeedUpdate = true;
              }
            }
          }
        }
      });

      console.log(cnt)
    } //end of if(intersects.length > 0)

});


window.addEventListener( 'keydown', function( event ){
  switch(event.keyCode) {
    case 81: // Q
      transformControl.setSpace( transformControl.space === "local" ? "world" : "local" );
      break;
    case 17: // ctrl

      break;
    case 83: //s: scale
      console.log("scale mode");
      transformControl.setMode("scale");
      break;

    case 87: //w: translate
      console.log("translating mode");
      transformControl.setMode("translate");
      break;

    case 82: // r: rotate
      console.log("rotation mode");
      transformControl.setMode("rotate");
      break;
  }
});
