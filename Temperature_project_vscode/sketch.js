

let url;
let ulat = "51.37433236749744";
let ulon = "-0.48220181010619695";
let apiKey = "ad18681a96d109fbeaa44c67db9598f4";
let heading = 0;
let radius = innerWidth / 3.2; //aesthetic only radius of compass 
let thickness = innerWidth / 3.6; //aesthetic thickness of compass
let roughness = 1; //lower values create a smoother disc at the cost of performance. Recommended values between 1 and 40. 
let tempCardinal = [160, 184, 144, 154];



///NOTES
/*


TO-DO:

MAKE SURE THAT NORTH IS FOUND CORRECTLY REGARDLESS OF STARTING ORIENTATION



Gets 4 compass directions NESW
N add 0.01 to long 
E add 0.01 to lat
S subtract 0.01 long
W subtract 0.01 lat


*/



function setup() {

  createCanvas(innerWidth, innerHeight);
  frameRate(15);

  setInterval(getCoords, 1000) //gets user position every second
  //setInterval(getTemp, 5000); //gets temperature every x seconds. Don't call this more than 4x/s  or the limit on the free api will be exceeded (they might send me an invoice ££££££££££££££)



}

//:):):)

function draw() {

  background(210, 189, 125);

  calcHeading();
  //print(heading);

  drawCompass();


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
  // console.log(ulat, ulon);

};

///////////////////////////////



function getTemp() {
  // When data is received, it will automatically call gotData function
  for (i = 0; i < 4; i++) {

    //North
    if (i == 1) {
      lat = ulat;
      lon = ulon + 0.01;

    }

    //East
    else if (i == 2) {
      lat = ulat + 0.01;
      lon = ulon

    }
    //South
    else if (i == 3) {
      lat = ulat;
      lon = ulon - 0.01;

    }
    //West
    else {
      lat = ulat - 0.01;
      lon = ulon;

    }

    url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey
    loadJSON(url, gotData); //makes api request
    console.log("got temp");
    tempCardinal[i] = data.main.temp - 273.15 //sets the temperature in degrees to one of four temperature storage slots
    tempCardinal[i] = constrain(tempCardinal[i] * 10, 0, 255); //multiplies by 10 to get a useable colour value.

  }
}

//:):):):):)


// Callback function that receives the API response data
function gotData(data) {
  // Gets the data and prints to log as celsius
  console.log(data.main.temp - 273.15);
  console.log(data.main.temp_min - 273.15);
  console.log(data.main.temp_max - 273.15);
}


//////////////////////////////////


//~~~~~~~~~~~~~~~~~~~~~~~~~FINDS NORTH, DESCRIBED BY AN ANGLE ON A CIRCLE WHERE 0 IS NORTH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//edited from:
//https://stackoverflow.com/questions/61336948/calculating-the-cardinal-direction-of-a-smartphone-with-js

function calcHeading() {

  const handleOrientation = (event) => {
    if (event.webkitCompassHeading) {
      // some devices don't understand "alpha" (especially IOS devices)
      heading = event.webkitCompassHeading;
    }
    else {
      heading = compassHeading(event.alpha, event.beta, event.gamma);

    }
  };

  window.addEventListener('deviceorientation', handleOrientation, false);

  const compassHeading = (alpha, beta, gamma) => {

    // Convert degrees to radians
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    const cA = Math.cos(alphaRad);
    const sA = Math.sin(alphaRad);
    const cB = Math.cos(betaRad);
    const sB = Math.sin(betaRad);
    const cG = Math.cos(gammaRad);
    const sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    const rA = - cA * sG - sA * sB * cG;
    const rB = - sA * sG + cA * sB * cG;
    const rC = - cB * cG;

    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;

  };

};

////////////////////////////////

function drawCompass() {



  for (i = 1; i <= 360 / roughness; i++) {

    var batch;
    angleMode(DEGREES);


    push();
    translate(width / 2, height / 2);
    rotate(heading);
    rotate(i * roughness);
    noStroke();
    //fills with a colour from the storage slots where appropriate

    fill(255 - i, 0.5 * i, 1 * i);
    if (i == 360) {
      fill(tempCardinal[0], 0, 255 - tempCardinal[0]);

    } else if (i == 90) {
      fill(tempCardinal[1], 0, 255 - tempCardinal[1]);

    } else if (i == 180) {
      fill(tempCardinal[2], 0, 255 - tempCardinal[2]);

    } else if (i == 270) {
      fill(tempCardinal[3], 0, 255 - tempCardinal[3]);;
    }

    //LERP BETWEEN COLOURS HERE

    else if (i < 90) {

      batch = lerp(tempCardinal[0], tempCardinal[1], i / 89)
      fill(batch, 0, 255 - batch);

    }

    else if (i > 90 && i < 180) {
      batch = lerp(tempCardinal[1], tempCardinal[2], (i - 90) / 89);
      fill(batch, 0, 255 - batch);

    }
    else if (i > 180 && i < 270) {
      batch = lerp(tempCardinal[2], tempCardinal[3], (i - 180) / 89);
      fill(batch, 0, 255 - batch);

    } else {
      batch = lerp(tempCardinal[3], tempCardinal[1], (i - 270) / 89);
      fill(batch, 0, 255 - batch);

    }



    ellipse(0, -radius, thickness);

    pop();

  };






}


///////////////////////////////////////////

