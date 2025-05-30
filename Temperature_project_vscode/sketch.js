let url;
let ulat = 51.37433236749744;
let ulon = -0.48220181010619695;
let lat = 0;
let lon = 0;
let cKey = "ad18681a96d109fbeaa44c67db9598f4";
let fKey = "cd7b36c3c57f6c477856f76a895f3707";
let apiKey;
let heading = 0;
let radius = innerWidth / 5; //aesthetic only radius of compass 
let thickness = innerWidth / 5.5; //aesthetic thickness of compass
let roughness = 1; //lower values create a smoother disc at the cost of performance. Recommended values between 1 and 40. Values other than 1 may not show temperature properly
let tempCushion = 1; 
let tempCardinal = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let tempCardinalRaw = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let calibrated = false;
let calibButton;
let calibHeadingAdjust = 0;
let done = 0;
let detectRadius = 1; //range temperature is detected at. 1 is a 5 minute walk, 2 is 10 mins, 3 is 15, etc
let minArray = [0];
let maxArray = [0];
let min = -5;
let max = 32;
let slot = 0;
let useCardinal;
let colourMethodR;
let colourMethodG;
let colourMethodB;
let isCardinal = false;
let weighted = false;
// original colour method for ref:           fill(tempCardinal[1], 0, 255 - tempCardinal[1]);

///NOTES
/*


The rotation may not work on iphone
Colour weighting currently too sensitive, consantly changing 


Gets 8 compass directions N NE E SE S SW W NW and the temperatures at those points within a 5 minute walk,
then plots on compass as colours. Currently the colours are raw tempertatures in celsius and not properly weighted. 

TO-DO:

Better heat weighting for the colours
Add text
Nicer looking button for caibration

*/



function setup() {

  createCanvas(innerWidth, innerHeight);
  frameRate(60);
  getCoords();
  setInterval(getCoords, 1000) //gets user position every second
  setInterval(getTemp, 10000); //gets temperature every x seconds. Don't call this more than 4x/s or the limit on the free api will be exceeded
  getTemp();
  calibButton = createButton("calibrate").mousePressed(calibButtonPressed);
  calibButton.position((width / 2) - ((width / 4) / 2), height / 2 - ((width / 4) / 2));
  calibButton.size(width / 4, width / 4);

}

//:):):)

function draw() {

  background(50);

  calcHeading();
  //print("Compass Heading:", heading);

  drawCompass();
  if (calibrated == false) {
    calibHeadingAdjust = heading;
  }


}

/////////////////////////////////////////

//~~~~~~~~~~~GETS USER LATITUDE AND LONGITUDE~~~~~~~~~~~~~~~~~~

//edited from source: https://editor.p5js.org/reachamaatra/sketches/p0HMlPu65

function getCoords() {
  navigator.geolocation.getCurrentPosition(getPosition);
};

function getPosition(position) {
  ulat = position.coords.latitude;
  ulon = position.coords.longitude;
  // console.log("ulat/ulon= " + ulat, ulon);


};

///////////////////////////////



async function getTemp() {
  done = 0;


  // When data is received, it will automatically call gotData function
  for (i = 0; i < 9; i++) {
    //North
    if (i == 0) {
      lat = ulat;
      lon = ulon + (0.01 * detectRadius);
      apiKey = cKey;

    }

    //NE
    else if (i == 1) {
      lat = ulat + (0.01 * detectRadius);
      lon = ulon + (0.01 * detectRadius);
      apiKey = fKey;

    }

    //East
    else if (i == 2) {
      lat = ulat + (0.01 * detectRadius);
      lon = ulon;
      apiKey = cKey;

    }

    //SEast
    else if (i == 3) {
      lat = ulat + (0.01 * detectRadius);
      lon = ulon - (0.01 * detectRadius);
      apiKey = fKey;

    }
    //South
    else if (i == 4) {
      lat = ulat;
      lon = ulon - (0.01 * detectRadius);
      apiKey = cKey;

    }

    //SWest
    else if (i == 5) {
      lat = ulat - (0.01 * detectRadius);
      lon = ulon - (0.01 * detectRadius);
      apiKey = fKey;

    }
    //West
    else if (i == 6) {
      lat = ulat - (0.01 * detectRadius);
      lon = ulon;
      apiKey = cKey;

    }

    //NWest
    else if (i == 7) {
      lat = ulat - (0.01 * detectRadius);
      lon = ulon + (0.01 * detectRadius);
      apiKey = fKey;

    }

    //Centre
    else if (i == 8) {
      lat = ulat
      lon = ulon
      apiKey = cKey;

    }

    url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey
    print("url: " + url);

    loadJSON(url, gotData); //makes api request
    console.log("got temp");
    let interLoop = setInterval(function () {

      if (done == 9) {
        clearInterval(interLoop);
        print("interLoop cleared");
        print("tempCardinal unmapped: " + tempCardinalRaw);
        if (weighted == false) {
          weighted = true;
          min = Math.min.apply(null, tempCardinalRaw);
          max = Math.max.apply(null, tempCardinalRaw);
          for (i = 0; i < tempCardinalRaw.length; i++) {
            tempCardinal[i] = map(tempCardinalRaw[i], min - tempCushion, max + tempCushion, 0, 1);
          }
        }

        print("Min: " + min);
        print("Max: " + max);
        tempCushion = (max-min)*2;
      }

    }, 10);
  }
}

////// :) :) :) :) :)

// Callback function that receives the API response data
function gotData(data) {

  if (data !== "null" && data !== "undefined") {
    done = done + 1;
    print("done: " + done);
    tempCardinalRaw[done - 1] = (data.main.temp - 273.15).toFixed(2); //sets the temperature in degrees to one of 8 temperature storage slots
    //tempCardinal[done-1] = constrain(tempCardinal[done-1] * 10, 0, 255); //multiplies by 10 to get a useable colour value.
    tempCardinal[done - 1] = map(tempCardinalRaw[done - 1], min - tempCushion, max + tempCushion, 0, 1); //remaps possible temperatures of -10c to 32c to lerp range 0-255 



  }
}




///////////////////////////////////////

function calibButtonPressed() {

  removeElements(calibButton);

  calibrated = true;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~FINDS NORTH, DESCRIBED BY AN ANGLE ON A CIRCLE WHERE 0 IS NORTH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//sourced:
//https://stackoverflow.com/questions/61336948/calculating-the-cardinal-direction-of-a-smartphone-with-js
//condensed and switched to horizontal by chat gpt
//edited by me

function calcHeading() {
  const handleOrientation = (event) => {


    // For iOS devices
    if (event.webkitCompassHeading !== undefined) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // For most other modern devices, when phone is flat
      // alpha is compass direction (0 is north)
      heading = event.alpha;
    }

    if (heading !== undefined) {
      if (calibrated == true) {
        heading = (heading % 360) - calibHeadingAdjust;

      } else {
        heading = heading % 360;
      }
      heading = heading.toFixed(0);
      heading = int(heading);

    }
  };

  window.addEventListener('deviceorientation', handleOrientation, true);
}


////////////////////////////////



//////////////////////////////////

function drawCompass() {



  //COLOUR WEIGHTING BASED ON RANGE


  minArray.push = Math.min.apply(null, tempCardinal);
  maxArray.push = Math.max.apply(null, tempCardinal);
  //print("minArray: " + minArray);
  //print("maxArray: " + maxArray);
  var sumMin = 0;
  var sumMax = 0;
  /*
    for (i = 0; i < minArray.length; i++) {
      sumMin = sumMin + minArray[i];
    }
  
    min = sumMin / (minArray.length - 1);
  
    for (i = 0; i < maxArray.length; i++) {
      sumMax = sumMin + maxArray[i];
    }
  
    max = sumMax / (maxArray.length - 1);
  
    print("min: " + min);
    print("max: " + max);
  
    for (i = 0; i < tempCardinal.length; i++) {
      tempCardinal[i] = map(tempCardinal[i], min, max, 0, 1);
    }
    print("tempCardinal mapped: " + tempCardinal);
  */

  //DRAWING THE COMPASS

  //DISPLAY USER TEMP AT CENTRE
  push()
  translate(width / 2, height / 2);
  fill(255);
  textAlign(CENTER);
  textSize(thickness / 4.5);
  text(tempCardinalRaw[8] + "c", 0, thickness / 10);
  pop()

  for (i = 1; i <= 360 / roughness; i++) {


    angleMode(DEGREES);

    push();
    translate(width / 2, height / 2);
    rotate(heading);
    rotate(i * roughness);


    noStroke();

    //Draw white lines
    fill(255);
    rectMode(CENTER);
    if (i % 45 == 0) {
      rect(0, radius * 1.64, thickness / 45, thickness / 3);
    } else if (i % 3 == 0) {
      rect(0, radius * 1.6, thickness / 90, thickness / 4);
    }


    //Draws North
    if (i == 360) {
      push();
      translate(0, -radius * 1.48);
      triangle(-thickness / 5, 0, 0, -thickness / 2.7, thickness / 5, 0);
      textSize(thickness / 4.5);
      fill(50);
      textAlign(CENTER);
      text("N", 0, -radius / 30);
      pop();
    }

    isCardinal = false;

    //N
    if (i == 360) {

      useCardinal = 0;
      isCardinal = true;


      //NE
    } else if (i == 45) {

      useCardinal = 1
      isCardinal = true;
      //E

    } else if (i == 90) {
      useCardinal = 2;
      isCardinal = true;
      //SE

    } else if (i == 135) {
      useCardinal = 3;
      isCardinal = true;

      //S

    } else if (i == 180) {
      useCardinal = 4;
      isCardinal = true;

      //SW

    } else if (i == 225) {
      useCardinal = 5;
      isCardinal = true;

      //W

    } else if (i == 270) {
      useCardinal = 6;
      isCardinal = true;


      //NW
    } else if (i == 315) {
      useCardinal = 7;
      isCardinal = true;
    }

    //LERP BETWEEN COLOURS HERE

    //NE
    else if (i < 45) {

      useCardinal = lerp(tempCardinal[0], tempCardinal[1], i / 44)
      //fill(batch, 0, 255 - batch);

    }
    //E
    else if (i > 45 && i < 90) {

      useCardinal = lerp(tempCardinal[1], tempCardinal[2], (i - 45) / 44)
      //fill(batch, 0, 255 - batch);

    }
    //SE
    else if (i > 90 && i < 135) {

      useCardinal = lerp(tempCardinal[2], tempCardinal[3], (i - 90) / 44)
      //fill(batch, 0, 255 - batch);

    }
    //S
    else if (i > 135 && i < 180) {
      useCardinal = lerp(tempCardinal[3], tempCardinal[4], (i - 135) / 44);
      //fill(batch, 0, 255 - batch);

    }
    //SW
    else if (i > 180 && i < 225) {
      useCardinal = lerp(tempCardinal[4], tempCardinal[5], (i - 180) / 44);
      //fill(batch, 0, 255 - batch);
    }

    //W

    else if (i > 225 && i < 270) {
      useCardinal = lerp(tempCardinal[5], tempCardinal[6], (i - 225) / 44);
      //fill(batch, 0, 255 - batch);

    }

    //NW
    else if (i > 270 && i < 315) {
      useCardinal = lerp(tempCardinal[6], tempCardinal[7], (i - 270) / 44);
      //fill(batch, 0, 255 - batch);

    }

    //N
    else {
      useCardinal = lerp(tempCardinal[7], tempCardinal[0], (i - 315) / 44);
      //fill(batch, 0, 255 - batch);

    }
    colourMethodR = lerp(0, 255, tempCardinal[useCardinal]);
    colourMethodG = lerp(255, 0, tempCardinal[useCardinal]);

    colourMethodB = lerp(83, 0, tempCardinal[useCardinal]);

    if (isCardinal == true) {

      fill(colourMethodR, colourMethodG, colourMethodB); //colour fill for cardinal points
    } else {
      fill(
        lerp(0, 255, useCardinal),
        lerp(255, 0, useCardinal),
        lerp(83, 0, useCardinal)
      ); //colour fill for lerps
    }

    ellipse(0, -radius, thickness);

    pop();

    //Draws numbers
    if (isCardinal == true) {

      push()
      translate(width / 2, height / 2);
      fill(255);
      textAlign(CENTER);
      textSize(thickness / 4.5);
      rotate(heading);
      rotate(i * roughness);
      text(tempCardinalRaw[useCardinal] + "c", 0, -radius * 1.9);

      if (tempCardinal[useCardinal] == Math.min.apply(null, tempCardinal) && useCardinal !== 8){
        stroke(255);
        strokeWeight(thickness / 64);
        noFill();
        circle(0,-radius * 1.99,thickness/1.25);
      }
      pop()



    }
  };






}


///////////////////////////////////////////

