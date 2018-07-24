$(document).click(function(event) {
    var text = $(event.target).text();
    console.log(text);
    console.log(event.target)

    // if(event.target.id == "softnessRange"){
    //   document.getElementById('shoreAScaleValue').value = '<br/> Shore A scale: ' + event.target.value;
    // }
});
