var parseSVG  = require('svg-path-parser');
var flatten   = require('flat');
var fs        = require('fs');

var nozzleSize = 0.4;
var filamentThickness = 1.75;
var gcodeInit = 'M109 S220.000000 \n\
M190 S50 ;Uncomment to add your own bed temperature line \n\
G21        ;metric values \n\
G91        ;relative positioning \n\
M82        ;set extruder to absolute mode \n\
M107       ;start with the fan off \n\
G28 X0 Y0  ;move X/Y to min endstops \n\
G28 Z0     ;move Z to min endstops \n\
G1 Z15.0 F9000 ;move the platform down 15mm \n\
G92 E0                  ;zero the extruded length \n\
G1 F200 E3              ;extrude 3mm of feed stock \n\
G92 E0                  ;zero the extruded length again \n\
G1 F9000 \n\
;Put printing message on LCD screen \n\
M117 Printing... \n'

var d1='M111.568,164.302h79.83v-119h-10.936v-18.2L95.699,45.214L10.938,27.097v18.2H0v119.005h79.831 M91.732,53.209v102.217 \
			l-72.855-15.571V53.209v-7.912v-8.395l39.263,8.395l33.586,7.179L91.732,53.209L91.732,53.209z M99.667,155.426V53.209v-0.733 \
			l33.587-7.179l39.277-8.395v8.395v7.912v86.646L99.667,155.426z';

// var d2='M54.749,25.176c-0.19-0.324-0.551-0.515-0.992-0.525c-0.697-0.015-1.719-0.03-2.934-0.03 \
// 		c-5.003,0-11.256,0.245-14.573,1.315c-0.827-4.362-5.541-12.502-7.682-16.036c-0.457-0.758-1.44-0.757-1.899,0 \
// 		c-2.16,3.569-6.941,11.828-7.704,16.156c-3.214-1.17-9.729-1.434-14.911-1.434c-1.216,0-2.237,0.015-2.934,0.03 \
// 		c-0.442,0.009-0.803,0.201-0.99,0.525c-0.186,0.324-0.173,0.732,0.04,1.12c2.187,3.977,7.635,13.438,10.998,15.38 \
// 		c1.333,0.77,2.847,1.177,4.377,1.177c3.128,0,6.042-1.681,7.603-4.387c0.589-1.019,0.959-2.122,1.106-3.255 \
// 		c1.037,0.433,2.174,0.674,3.366,0.674c1.064,0,2.081-0.2,3.026-0.55c0.157,1.089,0.518,2.149,1.085,3.131 \
// 		c1.561,2.706,4.474,4.387,7.603,4.387c1.53,0,3.044-0.407,4.377-1.177c3.363-1.942,8.812-11.403,10.998-15.381 \
// 		C54.922,25.908,54.936,25.501,54.749,25.176z M22.28,37.967c-1.384,2.397-3.965,3.887-6.737,3.887c-1.355,0-2.696-0.36-3.877-1.042 \
// 		c-2.569-1.484-7.171-8.72-10.621-14.996c-0.044-0.081-0.049-0.132-0.056-0.132c0.01-0.008,0.056-0.03,0.15-0.032 \
// 		c0.692-0.015,1.706-0.03,2.913-0.03c7.301,0,12.483,0.516,14.799,1.458c0,0.011-0.003,0.025-0.003,0.036 \
// 		c0,3.261,1.792,6.105,4.44,7.617C23.194,35.858,22.861,36.96,22.28,37.967z M19.875,27.638c1.565,1.046,2.688,2.599,3.181,4.434 \
// 		c0.133,0.497,0.216,1,0.25,1.503C21.359,32.271,20.041,30.11,19.875,27.638z M30.557,34.304c-0.907,0.372-1.898,0.581-2.938,0.581 \
// 		c-1.183,0.001-2.3-0.273-3.304-0.746c0.004-0.775-0.088-1.557-0.294-2.326c-0.606-2.262-2.057-4.153-4.086-5.324 \
// 		c-0.01-0.005-0.021-0.01-0.031-0.016c0.556-4.12,5.912-13.236,7.619-16.055c0.049-0.082,0.093-0.111,0.085-0.115 \
// 		c0.012,0.004,0.055,0.033,0.104,0.114c3.413,5.636,7.034,12.513,7.593,15.89c-0.126,0.059-0.256,0.117-0.365,0.181 \
// 		c-2.029,1.171-3.48,3.062-4.086,5.324C30.633,32.636,30.537,33.474,30.557,34.304z M31.819,32.072 \
// 		c0.53-1.979,1.791-3.634,3.553-4.674c-0.099,2.724-1.601,5.09-3.808,6.399C31.586,33.22,31.666,32.643,31.819,32.072z \
// 		 M53.83,25.815c-3.45,6.277-8.052,13.512-10.621,14.997c-1.181,0.682-2.521,1.042-3.877,1.042c-2.772,0-5.354-1.489-6.737-3.887 \
// 		c-0.549-0.952-0.878-1.987-0.992-3.049c2.835-1.454,4.784-4.402,4.784-7.803c0-0.052-0.012-0.116-0.014-0.17 \
// 		c2.467-0.857,7.502-1.323,14.449-1.323c1.207,0,2.221,0.015,2.913,0.03c0.095,0.002,0.142,0.024,0.142,0.017 \
// 		C53.88,25.68,53.876,25.732,53.83,25.815z M27.617,39.159c-1.762,0-3.195,1.433-3.195,3.194c0,1.763,1.434,3.196,3.195,3.196 \
// 		c1.762,0,3.195-1.434,3.195-3.196C30.812,40.591,29.378,39.159,27.617,39.159z M27.617,44.549c-1.211,0-2.195-0.985-2.195-2.196 \
// 		c0-1.21,0.984-2.194,2.195-2.194c1.211,0,2.195,0.984,2.195,2.194C29.812,43.564,28.828,44.549,27.617,44.549z'

var resultingJSON = parseSVG(d1);
var flatJSON = flatten(resultingJSON);
// var cmdLength = Object.keys(flatJSON).length;

function getExtrusionLength(x1, y1, x2, y2){
	var dist = getDistance(x1, y1, x2, y2);
  return ( Math.pow(nozzleSize, 2) * dist) / Math.pow(filamentThickness, 2);
}

function getDistance(x1, y1, x2, y2){
  // console.log(x1, y1, x2, y2)
  return Math.hypot(x1-x2, y1-y2);
}

function traverse(jsonObj) {
  var orinPts = {},
      prevPts = {},
      currPts = {};
	var prevPtsSVG = {},
			currPtsSVG = {};
	var ptsSequence = [];
  var dist= 0, extrusion = 0;
  var gcodeCmdString = gcodeInit + 'G91 \n'; //force to be relative because of extrusion

	let valueX, valueY;

  if( typeof jsonObj == "object" ) {
      Object.entries(jsonObj).forEach(([key, value]) => {
          // key is either an array index or object key
          // traverse(value); //go for flattening again << not necessary for now

        // console.log("key: ", key, " value: ", value.code); //key is cmd number, value is command sets
        var cmdCode = value.code;

        switch(cmdCode) {
          case 'M': //start pts
            currPts = {
              x: parseFloat(value.x),
              y: parseFloat(value.y)
            }
            gcodeCmdString += 'G0 X' + currPts.x + ' Y' + currPts.y + '\n';
            origPts = currPts;
						prevPts = currPts;
          break;

          case 'L': //absolute line to
						currPts = {
							x: parseFloat(value.x),
							y: parseFloat(value.y)
						}
            extrusion       += getExtrusionLength(currPts.x, currPts.y, prevPts.x, prevPts.y);
            gcodeCmdString  += 'G1 X' + currPts.x.toFixed(3) + ' Y' + currPts.y.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						prevPts = currPts;
          break;
          case 'l': //relative line to
            currPts = {
              x: parseFloat(value.x) + prevPts.x,
              y: parseFloat(value.y) + prevPts.y
            }
            extrusion       += getExtrusionLength(currPts.x, currPts.y, prevPts.x, prevPts.y);
						gcodeCmdString  += 'G1 X' + currPts.x.toFixed(3) + ' Y' + currPts.y.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						prevPts = currPts;
          break;

          case 'Z': //close path, abolute
						extrusion       += getExtrusionLength(prevPts.x, prevPts.y, origPts.x, origPts.y);
						gcodeCmdString  += 'G1 X' + origPts.x.toFixed(3) + ' Y' + origPts.y.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						origPts = {};
						prevPts = {};
					break;

          case 'H': //absolute horizontal line to only x value
						currPts = {
              x: parseFloat(value.x),
              y: prevPts.y
            }
						extrusion       += getExtrusionLength(currPts.x, currPts.y, prevPts.x, prevPts.y);
						gcodeCmdString  += 'G1 X' + currPts.x.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						prevPts = currPts;
					break;
          case 'h':
            currPts = {
              x: prevPts.x + parseFloat(value.x),
              y: prevPts.y //no value
            }
						extrusion       += getExtrusionLength(currPts.x, currPts.y, prevPts.x, prevPts.y);
						gcodeCmdString  += 'G1 X' + currPts.x.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						prevPts = currPts;
					break;

          case 'V': //absolute vertical line to. only y value
						valueY =
            currPts = {
              x: prevPts.x,
              y: parseFloat(value.y)
            }
						extrusion       += getExtrusionLength(currPts.x, currPts.y, prevPts.x, prevPts.y);
						gcodeCmdString  += 'G1 Y' + currPts.y.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						prevPts = currPts;
					break;
          case 'v': //relative vertical line to.
						valueY =
            currPts = {
              x: prevPts.x,
              y: prevPts.y + parseFloat(value.y)
            }
						extrusion       = getExtrusionLength(currPts.x, currPts.y, prevPts.x, prevPts.y);
						gcodeCmdString  += 'G1 Y' + currPts.y.toFixed(3) + ' E' + extrusion.toFixed(5) + '\n';
						prevPts = currPts;
					break;

          default:
            //bezier curve is not addressed yet
					break;
        } //end of switch-case
				// prevPts = currPts; //renew prev pts info

    }); //end of forEach

    console.log(gcodeCmdString);
    fs.writeFile('test.gcode', gcodeCmdString, (req, res, err) => {
      if(err) console.log(err)
    })
  }
  else {
    ; //not necessary for now
      // console.log("else: ", jsonObj)
  }
}

traverse(resultingJSON);
// console.log(resultingJSON)
