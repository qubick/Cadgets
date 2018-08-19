$(document).click(function(event) {
    var text = $(event.target).text();
    console.log(text);
    console.log(event.target)

    // if(event.target.id == "softnessRange"){
    //   document.getElementById('shoreAScaleValue').value = '<br/> Shore A scale: ' + event.target.value;
    // }
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
