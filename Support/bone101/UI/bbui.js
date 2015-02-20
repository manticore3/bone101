// Interface declarations and functions
//setTargetAddress('192.168.7.2', { initialized: ledsOff } );

var inputRead = [];
var analog = [];
var outputPin;
var activePins = [];

// toggle pin on/off or blink
function pinChange(data) {
    var b = require('bonescript');
    if (!b) return;
    var len = activePins.length;
    var duplicate;
    for (var i = 0; i < len; i++) {
        if (data.id === activePins[i].id) {
            duplicate = true;
        }
    }
    if (duplicate !== true) {
        activePins[len] = {
            id: data.id,
            type: data.type,
            subType: data.subType,
            num: data.num
        };
    }
    if (data.type === 'usr leds' || data.subType != "input" && data.subType != "pwm") {
        b.pinMode(data.id, b.OUTPUT);
        if (data.power === "on") {
            if (data.freq !== 0) {
                data.state = data.state ? 0 : 1;
                b.digitalWrite(data.id, data.state);
            }
            else {
                b.digitalWrite(data.id, 1);
            }
        }
        else {
            b.digitalWrite(data.id, 0);
        }
    }
    else if (data.subType === "pwm") {
        if (data.power === "on") {
            b.analogWrite(data.id, data.freq);
        }
        else {
            b.analogWrite(data.id, 0);
        }
    }
}

// turn leds off once html loaded
function ledsOff(data) {
    var b = require('bonescript');
    if (!b) return;
    b.pinMode('USR0', b.OUTPUT);
    b.pinMode('USR1', b.OUTPUT);
    b.pinMode('USR2', b.OUTPUT);
    b.pinMode('USR3', b.OUTPUT);
    b.digitalWrite('USR0', 0);
    b.digitalWrite('USR1', 0);
    b.digitalWrite('USR2', 0);
    b.digitalWrite('USR3', 0);
}

// get analog values once pin connected
function start(data) {
    var b = require('bonescript');
    if (!b) return;
    analog[0] = data.num;
    if (data.power === "on") {
        b.analogRead(data.id, analogValue);
    }
}

// retrieve the analog value and send it back
function analogValue(x) {
    var currentValue = x.value * 1.8;
    analog[1] = currentValue;
    voltageValue(analog);
}


// check to see if input on
function checkInput(data) {
    var b = require('bonescript');
    if (!b) return;
    b.pinMode(data.id, b.INPUT);
    b.pinMode(data.output, b.OUTPUT);
    outputPin = data.output;
    b.digitalRead(data.id, checkPin);
}

function checkPin(x) {
    // TODO: Not sure why this function exists
}

// ****************************************
// * INITIALIZATION/CREATION OF VARIABLES *
// ****************************************

// canvas with bb and other unchanging elements
var canvasBase = document.getElementById('layer1');
var ctxBase = canvasBase.getContext("2d");
// canvas that draws buttons and their corresponding elements, could be on Base, but if 
// eventually want to delete elements on it, would be better if on own 
var canvasBTN = document.getElementById('layer2');
var ctxBTN = canvasBTN.getContext("2d");
// active canvas, constantly being cleared and redrawn with user interaction
var canvasActive = document.getElementById('layer3');
var ctxActive = canvasActive.getContext("2d");
// separate canvases for LEDs so they can redraw at different rates while blinking
// could also create canvas once led selected
var canvasLED0 = document.getElementById('layer4');
var canvasLED1 = document.getElementById('layer5');
var canvasLED2 = document.getElementById('layer6');
var canvasLED3 = document.getElementById('layer7');
var ctxLED0 = canvasLED0.getContext("2d");
var ctxLED1 = canvasLED1.getContext("2d");
var ctxLED2 = canvasLED2.getContext("2d");
var ctxLED3 = canvasLED3.getContext("2d");
// canvas for slider bars
var canvasBar = document.getElementById('layer8');
var ctxBar = canvasBar.getContext("2d");
// matrix for added canvases for led blinking and plotting graph
var canvas = [];
var ctx = [];
var canvasGraph = [];
var ctxGraph = [];
// canvas for base drawings of graph (axis, labels, etc)
canvasGraph[0] = document.getElementById('layer9');
ctxGraph[0] = canvasGraph[0].getContext('2d');

// initialize global positions of some elements, all other elements based on these 
// positions
var BBposX = 460;
var BBposY = 60;
var btnWidth = 100;
var btnHeight = 15;
var btn = [];
var btnStatus = "none";
var btnType = "none";
var newPin = "unactive";
var bar = [];
var pinType = "none";
var currentPin = "none";
var USRtext = ['USR0', 'USR1', 'USR2', 'USR3'];
var rect = {
    x: 0,
    y: BBposY - 20,
    w: canvasBase.width,
    h: 540
};
var rectInner = {
    x: rect.x + 20,
    y: rect.y + 15,
    w: 420,
    h: 510
};
var snapPosPin = {
    x: rect.x + 35,
    y: rect.y + 25
};
var USRcontext = [ctxLED0, ctxLED1, ctxLED2, ctxLED3];
var USRcanvas = [canvasLED0, canvasLED1, canvasLED2, canvasLED3];
var pin = [];
var pinPosX = [];
var pinPosY = [];
var P8 = ['GND', 'GND', 'P8_3', 'P8_4', 'P8_5', 'P8_6', 'P8_7', 'P8_8', 'P8_9', 'P8_10', 'P8_11', 'P8_12', 'P8_13', 'P8_14', 'P8_15', 'P8_16', 'P8_17', 'P8_18', 'P8_19', 'P8_20', 'P8_21', 'P8_22', 'P8_23', 'P8_24', 'P8_25', 'P8_26', 'P8_27', 'P8_28', 'P8_29', 'P8_30', 'P8_31', 'P8_32', 'P8_33', 'P8_34', 'P8_35', 'P8_36', 'P8_37', 'P8_38', 'P8_39', 'P8_40', 'P8_41', 'P8_42', 'P8_43', 'P8_44', 'P8_45', 'P8_46'];
var P9 = ['GND', 'GND', 'VDD 3.3V', 'VDD 3.3V', 'VDD 5V', 'VDD 5V', 'SYS 5V', 'SYS 5V', 'PWR_BUT', 'SYS_RESETn', 'P9_11', 'P9_12', 'P9_13', 'P9_14', 'P9_15', 'P9_16', 'P9_17', 'P9_18', 'P9_19', 'P9_20', 'P9_21', 'P9_22', 'P9_23', 'P9_24', 'P9_25', 'P9_26', 'P9_27', 'P9_28', 'P9_29', 'P9_30', 'P9_31', 'P9_32', 'P9_33', 'P9_34', 'P9_35', 'P9_36', 'P9_37', 'P9_38', 'P9_39', 'P9_40', 'P9_41', 'P9_42', 'GND', 'GND', 'GND', 'GND'];


// global buttons
var btnX = BBposX - 425;
var btnY = BBposY - 40;
var analogBTN = {
    x: btnX,
    y: btnY,
    endX: btnX + 75,
    endY: btnY + 15,
    color: 'rgb(51,153,255)',
    text: "analog",
    s: 13,
    offColor: 'rgb(0,51,102)',
    article: "an analog pin"
};
var digitalBTN = {
    x: btnX + 78,
    y: btnY,
    endX: btnX + 153,
    endY: btnY + 15,
    color: 'rgb(102,204,51)',
    text: "digital",
    s: 10
};
var gndBTN = {
    x: btnX + 156,
    y: btnY,
    endX: btnX + 231,
    endY: btnY + 15,
    color: 'rgb(64,64,64)',
    text: "ground",
    s: 12
};
var powerBTN = {
    x: btnX + 234,
    y: btnY,
    endX: btnX + 309,
    endY: btnY + 15,
    color: 'rgb(255,51,51)',
    text: "power",
    s: 17
};
var ledBTN = {
    x: btnX + 312,
    y: btnY,
    endX: btnX + 387,
    endY: btnY + 15,
    color: 'rgb(255,153,51)',
    text: "usr leds",
    s: 7,
    offColor: 'rgb(102,0,0)',
    barColor: 'rgb(255,204,153)',
    article: "a user led"
};
var inputBTN = {
    x: btnX + 78,
    y: btnY + 20,
    endX: btnX + 153,
    endY: btnY + 35,
    color: 'rgb(0,153,0)',
    text: "input",
    s: 17,
    offColor: 'rgb(0,81,36)',
    article: "a digital pin"
};
var outputBTN = {
    x: btnX + 78,
    y: btnY + 40,
    endX: btnX + 153,
    endY: btnY + 55,
    color: 'rgb(0,153,153)',
    text: "output",
    s: 13,
    offColor: 'rgb(0,85,85)',
    barColor: 'rgb(153,255,255)',
    article: "a digital pin"
};
var pwmBTN = {
    x: btnX + 78,
    y: btnY + 60,
    endX: btnX + 153,
    endY: btnY + 75,
    color: 'rgb(153,0,153)',
    text: "pwm",
    s: 25,
    offColor: 'rgb(51,0,102)',
    barColor: 'rgb(229,204,255)',
    article: "a pwm pin"
};

// colors for graph
var analogColor = ['rgb(0,0,255)', 'rgb(0,01,53)', 'rgb(0,102,204)', 'rgb(0,51,102)'];
var inputColor = ['rgb(0,51,0)', 'rgb(0,204,0)', 'rgb(51,102,0)', 'rgb(0,255,0)', 'rgb(128,255,0)'];
var outputColor = ['rgb(60,179,113)', 'rgb(0,153,153)', 'rgb(0,255,255)', 'rgb(0,102,102)'];
var pwmColor = ['rgb(102,0,102)', 'rgb(204,0,204)', 'rgb(255,102,255)', 'rgb(51,0,51)'];
var ledColor = ['rgb(255,128,0)', 'rgb(164,60,0)', 'rgb(255,99,71)', 'rgb(255,69,0)'];
var graphLinePos = BBposY + 40;

// all graph global variables
var axisStartY = BBposY + 40;
var axisStartX = BBposX + 375;
var xWidth = 375;
var yWidth = 400;
var zeroX = axisStartX;
var zeroY = axisStartY + yWidth / 2;
var zoomVal = [.125, .25, .5, 1];
var zoomIndex = 3;
var zoom = zoomVal[zoomIndex];
var xScale = 100;
var yScale = 40;
var prevPoint = [];
var plus = {
    x: axisStartX + 10,
    y: axisStartY + 451,
    endX: axisStartX + 25,
    endY: axisStartY + 451
};
var minus = {
    x: plus.x - 20,
    y: plus.y + 2,
    endX: plus.endX - 20,
    endY: plus.endY
};
var stopBtn = {
    x: minus.x - 19,
    y: minus.y - 16,
    endX: minus.endX - 22,
    endY: minus.endY
};
var playBtn = {
    x: minus.x - 38,
    y: minus.y - 17,
    endX: minus.endX - 39,
    endY: minus.endY
};
var timer;
var timeCount = 0;
var voltage = [];
var voltCount = 0;
var pinNum = 0;
var interval = 0;
var status;
var timeValues = [];
var btnCheck = false;
var voltagePin = [];

//initialize coordinate positions for LEDs
var USRY = BBposY + 27;
var USRX = [230.5, 241.75, 253, 264.25];
for (var i = 0; i < 4; i++) {
    USRX[3 - i] += BBposX;
}

//create USR LEDs
var USR = [];
for (var i = 0; i < 4; i++) {
    num = i;
    name = USRtext[i];
    USR[i] = new createUSR(USRX[3 - i], USRY, num, name);
    USR[i].state = 0;
}

// pin positions
for (var i = 0; i < 46; i++) {
    //	 if even
    var x;
    var y;
    if ((i % 2) === 0) {
        x = BBposX + 7;
        y = BBposY + 129 + 14.05 * (i / 2);
    }
    // if odd
    else {
        x = BBposX + 22;
    }
    pinPosY[i] = y;
    pinPosX[i] = x;
    pinPosX[i + 46] = x + 273;
    pinPosY[i + 46] = y;
}

// initialize all pins with corresponding properties
for (var i = 0; i < 96; i++) {
    var matrix;
    if (i < 46) {
        matrix = P9;
        var j = i;
    }
    else {
        matrix = P8;
        var j = i - 46;
    }
    if ((0 <= i && i < 10) || (31 === i || i === 33) || (42 <= i && i <= 47)) {
        if ((0 <= i && i < 2) || (i === 33) || (42 <= i && i <= 47)) {
            pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "GND", i);
        }
        else if ((2 <= i && i < 8) || (i === 31)) {
            pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "power", i);
        }
        else {
            pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "reset", i)
        };
    }
    else if ((10 <= i && i <= 17) || (20 <= i && i <= 30) || (40 <= i && i <= 42) || (48 <= i && i <= 91)) {
        if (i == 13 || i == 15 || i == 20 || i == 21 || i == 41 || i == 58 || i == 64) {
            pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "digital", i);
            pin[i].subType = "none";
            pin[i].PWM = "yes";
        }
        else {
            pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "digital", i);
            pin[i].subType = "none";
            pin[i].PWM = "no";
        }
        if (48 <= i && i <= 54) {
            pin[i].s = 22;
        }
    }
    else if (i === 32 || (34 <= i && i <= 39)) {
        pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "analog", i);
    }
    else if (i >= 92) {
        pin[i] = USR[i - 92];
        pin[i].num = i;
    }
    else {
        pin[i] = new createPin(pinPosX[i], pinPosY[i], matrix[j], "Shared 12C Bus", i);
    }
};

// draw beagleboard		
var beagleBone = new Image();
beagleBone.src = 'http://i1382.photobucket.com/albums/ah247/jennifer_thomas8/beaglebone_zps8b842e07.png';
beagleBone.onload = function() {
    ctxBase.drawImage(beagleBone, BBposX, BBposY);
};

//// draw gray background, buttons, and graph
drawGraph();
ctxBase.fillStyle = 'rgb(225,225,225)';
ctxBase.fillRect(rect.x, rect.y, rect.w, rect.h)
ctxBase.strokeStyle = 'rgb(255,255,255)';
ctxBase.lineWidth = 3;
ctxBase.strokeRect(rect.x + 20, rect.y + 15, 420, 510);
drawButtons();
welcomeMessage('white');

// **************************************
// * EVENTS AND CORRESPONDING FUNCTIONS *
// **************************************

// event listeners

// receive analog voltage from server
function voltageValue(pinData) {
    var len = pin[pinData[0]].volt.length;
    pin[pinData[0]].volt[len] = pinData[1];
}

// eventually draw led next to output when input on
// socket.on('outputStatus', function (output){
//     pin[output[0]].power = output[1];
// 	drawLED(pin[output[0]]);
// });

// when a button is added, two new canvases are created
function createCanvas(pin) {
    var len = canvas.length;
    canvas[len] = document.createElement('canvas');
    canvas[len].id = pin.id;
    canvas[len].width = 1224;
    canvas[len].height = 600;
    canvas[len].style.zIndex = 10;
    canvas[len].style.left = 0;
    canvas[len].style.right = 0;
    canvas[len].style.top = 0;
    canvas[len].style.bottom = 0;
    canvas[len].style.margin = 'auto';
    canvas[len].style.position = "absolute";
    document.body.appendChild(canvas[len]);
    ctx[len] = canvas[len].getContext('2d');
    pin.ctx = ctx[len];
    pin.canvas = canvas[len];
    canvasGraph[len + 1] = document.createElement('canvas');
    canvasGraph[len + 1].id = pin.id + "Graph";
    canvasGraph[len + 1].width = 1224;
    canvasGraph[len + 1].height = 600;
    canvasGraph[len + 1].style.zIndex = 10;
    canvasGraph[len + 1].style.left = 0;
    canvasGraph[len + 1].style.right = 0;
    canvasGraph[len + 1].style.top = 0;
    canvasGraph[len + 1].style.bottom = 0;
    canvasGraph[len + 1].style.margin = 'auto';
    canvasGraph[len + 1].style.position = "absolute";
    //canvasGraph[len+1].style.border = "1px solid"; //test
    document.body.appendChild(canvasGraph[len + 1]);
    ctxGraph[len + 1] = canvasGraph[len + 1].getContext('2d');
    pin.ctxGraph = ctxGraph[len + 1];
    pin.canvasGraph = canvasGraph[len + 1];
};

// find position of mouse
function Position(event) {
    var x;
    var y;

    if (event.x != undefined && event.y != undefined) {
        x = event.x;
        y = event.y;
    }
    else // Firefox method to get the position
    {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -= canvasBase.offsetLeft;
    y -= canvasBase.offsetTop;
    var coord = [x, y];
    return coord;
};

// event listeners for welcome message
function exitHover(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
    if (x < canvasBase.width * 6 / 8 && x > canvasBase.width * 6 / 8 - 20 && y < canvasBase.height / 4 + 20 && y > canvasBase.height / 4) {
        welcomeMessage('black');
    }
    else {
        welcomeMessage('white');
    }
}

// if click on exit, remove welcome message and reinstate all other listeners
function exit(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    if (x < canvasBase.width * 6 / 8 && x > canvasBase.width * 6 / 8 - 20 && y < canvasBase.height / 4 + 20 && y > canvasBase.height / 4) {
        ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
        document.removeEventListener('click', exit, false);
        document.removeEventListener('mousemove', exitHover, false);
        document.addEventListener('mousedown', clickDown, false);
        document.addEventListener('mouseup', release, false);
        document.addEventListener('click', clicked, false);
        document.addEventListener('mousemove', btnInfo, false);
    }
}

// on mousemove, if over button, display associated pins
function btnInfo(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height)
    if (x >= analogBTN.x && x <= analogBTN.endX && y >= analogBTN.y && y <= analogBTN.endY) {
        roundRect(analogBTN, 75, 15, 1, ctxActive, true);
        for (i = 32; i < 40; i++) {
            if (pin[i].type === "analog") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else if (x >= digitalBTN.x && x <= digitalBTN.endX && y >= digitalBTN.y && y < digitalBTN.endY) {
        document.addEventListener('mousemove', digitalMenu, false);
        ctxActive.fillStyle = 'rgba(255,255,255,.7)';
        ctxActive.fillRect(digitalBTN.x - 2, digitalBTN.y, pwmBTN.endX - digitalBTN.x + 4,
        pwmBTN.endY - digitalBTN.y + 2)
        roundRect(digitalBTN, 75, 15, 1, ctxActive, true);
        roundRect(inputBTN, 75, 15, 1, ctxActive, false);
        roundRect(outputBTN, 75, 15, 1, ctxActive, false);
        roundRect(pwmBTN, 75, 15, 1, ctxActive, false);
        for (i = 0; i < 92; i++) {
            if (pin[i].type === "digital") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else if (x >= gndBTN.x && x <= gndBTN.endX && y >= gndBTN.y && y <= gndBTN.endY) {
        roundRect(gndBTN, 75, 15, 1, ctxActive, true);
        for (i = 0; i < 50; i++) {
            if (pin[i].type === "GND") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else if (x >= powerBTN.x && x <= powerBTN.endX && y >= powerBTN.y && y <= powerBTN.endY) {
        roundRect(powerBTN, 75, 15, 1, ctxActive, true);
        for (i = 0; i < 32; i++) {
            if (pin[i].type === "power") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else if (x >= ledBTN.x && x <= ledBTN.endX && y >= ledBTN.y && y <= ledBTN.endY) {
        roundRect(ledBTN, 75, 15, 1, ctxActive, true);
        for (i = 92; i < 96; i++) {
            if (pin[i].type === "usr leds" && pin[i].select === "off") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
}

// if over digital button, show types
function digitalMenu(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    document.addEventListener('mousedown', clickDownDigital, false);
    if (x >= digitalBTN.x && x <= digitalBTN.endX && y >= digitalBTN.y && y < digitalBTN.endY) {
        // already called on btninfo, but needed to ensure event listener on
    }
    else if (x >= inputBTN.x && x <= inputBTN.endX && y >= inputBTN.y - 5 && y <= inputBTN.endY) {
        ctxActive.fillStyle = 'rgba(255,255,255,.7)';
        ctxActive.fillRect(digitalBTN.x - 2, inputBTN.y - 5, pwmBTN.endX - digitalBTN.x + 4,
        pwmBTN.endY - inputBTN.y + 7);
        roundRect(outputBTN, 75, 15, 1, ctxActive, false);
        roundRect(inputBTN, 75, 15, 1, ctxActive, true);
        roundRect(pwmBTN, 75, 15, 1, ctxActive, false);
        for (i = 0; i < 92; i++) {
            if (pin[i].type === "digital") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else if (x >= outputBTN.x && x <= outputBTN.endX && y >= outputBTN.y - 5 && y <= outputBTN.endY) {
        ctxActive.fillStyle = 'rgba(255,255,255,.7)';
        ctxActive.fillRect(digitalBTN.x - 2, inputBTN.y - 5, pwmBTN.endX - digitalBTN.x + 4,
        pwmBTN.endY - inputBTN.y + 7);
        roundRect(outputBTN, 75, 15, 1, ctxActive, true);
        roundRect(inputBTN, 75, 15, 1, ctxActive, false);
        roundRect(pwmBTN, 75, 15, 1, ctxActive, false);
        for (i = 0; i < 92; i++) {
            if (pin[i].type === "digital") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else if (x >= pwmBTN.x && x <= pwmBTN.endX && y >= pwmBTN.y - 5 && y <= pwmBTN.endY) {
        ctxActive.fillStyle = 'rgba(255,255,255,.7)';
        ctxActive.fillRect(digitalBTN.x - 2, inputBTN.y - 5, pwmBTN.endX - digitalBTN.x + 4,
        pwmBTN.endY - inputBTN.y + 7);
        roundRect(outputBTN, 75, 15, 1, ctxActive, false);
        roundRect(inputBTN, 75, 15, 1, ctxActive, false);
        roundRect(pwmBTN, 75, 15, 1, ctxActive, true);
        for (i = 0; i < 92; i++) {
            if (pin[i].PWM === "yes") {
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
    else {
        document.removeEventListener('mousemove', digitalMenu, false);
        document.removeEventListener('mousedown', clickDownDigital, false);
    }
}

// if clicked on global button, slider, or graph button
function clickDown(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    var barlen = bar.length;
    // if on analog button
    if (x >= analogBTN.x && x <= analogBTN.endX && y >= analogBTN.y && y <= analogBTN.endY) {
        btnType = analogBTN;
        btnStatus = "active";
        document.addEventListener('mousemove', activateBtn, false);
    }
    // if on led button
    else if (x >= ledBTN.x && x <= ledBTN.endX && y >= ledBTN.y && y <= ledBTN.endY) {
        btnType = ledBTN;
        btnStatus = "active";
        document.addEventListener('mousemove', activateBtn, false);
    }
    // if on a slider	
    for (var i = 0; i < barlen; i++) {
        if (x <= (bar[i].sliderX + 10) && x >= bar[i].sliderX && y >= bar[i].sliderY && y <= (bar[i].sliderY + 10.5)) {
            bar[i].move = 'on';
            document.addEventListener('mousemove', slideBar, false);
        }
        else if (x <= (bar[i].barLength + bar[i].barLocX) && x >= (bar[i].barLocX + 2) && y <= (bar[i].barHeight + bar[i].barLocY) && y >= bar[i].barLocY) {
            bar[i].sliderX = x - 5;
            if (bar[i].sliderX < bar[i].barLocX + 2) {
                bar[i].sliderX = bar[i].barLocX + 2;
                pin[bar[i].pin].freq = 0;
            }
            else if (bar[i].sliderX > bar[i].barLength + bar[i].barLocX - 12) {
                bar[i].sliderX = bar[i].barLength + bar[i].barLocX - 12;
            }
            if (bar[i].type === "PWM") {
                bar[i].frequency = ((bar[i].sliderX - bar[i].barLocX - 2) / 140).toPrecision(2);
            }
            else {
                bar[i].frequency = ((bar[i].sliderX - bar[i].barLocX - 2) / 14).toPrecision(2);
            }
            if (bar[i].type === "PWM") {
                pin[bar[i].pin].freq = bar[i].frequency;
            }
            else {
                pin[bar[i].pin].freq = bar[i].frequency * 1000;
            }
            if (pin[bar[i].pin].freq != 0 && pin[bar[i].pin].power === 'on') {
                blink(pin[bar[i].pin]);
            }
            else if (pin[bar[i].pin].power === 'on') {
                drawLED(pin[bar[i].pin]);
            }
            if (bar[i].type === "PWM") {
                bar[i].text = (bar[i].frequency).toString();
            }
            else {
                bar[i].text = bar[i].frequency.toString() + ' s';
            }
            bar[i].move = 'on';
            document.addEventListener('mousemove', slideBar, false);
            drawBar();
        }
    }
    // if on zoom in (plus sign)
    if (x <= plus.endX && x >= plus.x && y >= (plus.y - 15) && y <= plus.endY) {
        document.addEventListener('mouseup', zooming, false);
        zoomChange("in");
        ctxGraph[0].fillStyle = "#FF4500";
        ctxGraph[0].font = '20pt Lucinda Grande';
        ctxGraph[0].fillText("+", plus.x, plus.y);
    }
    // if on zoom out (minus sign)
    else if (x <= minus.endX && x >= minus.x && y >= minus.y - 15 && y <= minus.endY) {
        document.addEventListener('mouseup', zooming, false);
        zoomChange("out");
        ctxGraph[0].fillStyle = "#FF4500";
        ctxGraph[0].font = '30pt Lucinda Grande';
        ctxGraph[0].fillText("-", minus.x, minus.y);
    }
    // if on stop button
    else if (x <= stopBtn.endX && x >= stopBtn.x && y >= stopBtn.y - 15 && y <= stopBtn.endY) {
        document.addEventListener('mouseup', stop, false);
        ctxGraph[0].fillStyle = "#FF4500";
        ctxGraph[0].beginPath();
        ctxGraph[0].moveTo(stopBtn.x, stopBtn.y);
        ctxGraph[0].lineTo(stopBtn.x + 12, stopBtn.y);
        ctxGraph[0].lineTo(stopBtn.x + 12, stopBtn.y + 12);
        ctxGraph[0].lineTo(stopBtn.x, stopBtn.y + 12);
        ctxGraph[0].fill();
    }
    // if on play button
    else if (x <= playBtn.endX && x >= playBtn.x && y >= playBtn.y - 15 && y <= playBtn.endY) {
        ctxGraph[0].fillStyle = "#FF4500";
        ctxGraph[0].beginPath();
        ctxGraph[0].moveTo(playBtn.x, playBtn.y);
        ctxGraph[0].lineTo(playBtn.x + 10, playBtn.y + 7);
        ctxGraph[0].lineTo(playBtn.x, playBtn.y + 14);
        ctxGraph[0].fill();
        document.addEventListener('mouseup', record, false);
    }
};

// if click on/off button
function clicked(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    var len = btn.length;
    // if new pin selected and now connected to led
    if (newPin === 'active') {
        pin[currentPin].power = "on";
        drawLED(pin[currentPin]);
        voltagePin.push(pin[currentPin].num);
        getVoltage(pin[currentPin]);
        newPin = 'unactive';
    }
    for (var i = 0; i < len; i++) {
        if (x >= btn[i].xOnOff && x <= btn[i].xOnOff + 25 && y >= btn[i].yOnOff && y <= btn[i].yOnOff + btn[i].h && (pin[btn[i].pinNum].power === 'off')) {
            if (pin[btn[i].pinNum].freq != 0) {
                pin[btn[i].pinNum].HIGH = 1;
                pin[btn[i].pinNum].power = 'on';
                blink(pin[btn[i].pinNum]);
                on(btn[i]);
            }
            else {
                pin[btn[i].pinNum].power = 'on';
                on(btn[i]);
                if (pin[btn[i].pinNum].type === 'analog') {
                    var data = {
                        num: pin[btn[i].pinNum].num,
                        id: pin[btn[i].pinNum].id,
                        power: pin[btn[i].pinNum].power
                    };
                    clearInterval(pin[btn[i].pinNum].getVoltage);
                    pin[btn[i].pinNum].getVoltage = setInterval(function() {
                        start(data)
                    }, 50);
                }
                drawLED(pin[btn[i].pinNum]);
            }
        }
        else if (x >= btn[i].xOnOff + 25 && x <= btn[i].xOnOff + 50 && y >= btn[i].yOnOff && y <= btn[i].yOnOff + btn[i].h && (pin[btn[i].pinNum].power === 'on')) {
            clearInterval(pin[btn[i].pinNum].blinking);
            pin[btn[i].pinNum].power = 'off';
            pin[btn[i].pinNum].HIGH = 1;
            off(btn[i]);
            if (pin[btn[i].pinNum].type === 'analog') {
                var data = {
                    num: pin[btn[i].pinNum].num,
                    id: pin[btn[i].pinNum].id,
                    power: pin[btn[i].pinNum].power
                };
                clearInterval(pin[btn[i].pinNum].getVoltage);
                pin[btn[i].pinNum].getVoltage = setInterval(function() {
                    zeroVolt(data)
                }, 50);
            }
            drawLED(pin[btn[i].pinNum]);
        }
    }
};
// ********************
// * BUTTON FUNCTIONS *
// ********************
// click on digital type button
function clickDownDigital(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    if (x >= inputBTN.x && x <= inputBTN.endX && y >= inputBTN.y - 5 && y <= inputBTN.endY) {
        btnType = inputBTN;
        btnStatus = "active";
        document.addEventListener('mousemove', activateBtn, false);
    }
    else if (x >= outputBTN.x && x <= outputBTN.endX && y >= outputBTN.y - 5 && y <= outputBTN.endY) {
        btnType = outputBTN;
        btnStatus = "active";
        document.addEventListener('mousemove', activateBtn, false);
    }
    else if (x >= pwmBTN.x && x <= pwmBTN.endX && y >= pwmBTN.y - 5 && y <= pwmBTN.endY) {
        btnType = pwmBTN;
        btnStatus = "active";
        document.addEventListener('mousemove', activateBtn, false);
    }
    document.removeEventListener('mousemove', digitalMenu, false);
}

// dragging button to position
function activateBtn(event) {
    document.removeEventListener('mousemove', btnInfo, false);
    document.removeEventListener('mousedown', clickDownDigital, false);
    document.removeEventListener('mousedown', clickDown, false);
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
    btnCheck = true;
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    pinType = btnType.text;
    x -= 50;
    y -= 7.5;
    drawBtn(75, 15, x, y, ctxActive, btnType, btnType.s, btnType.text, 1, true);
    if (btnType.text === "input" || btnType.text === "output") {
        pinType = "digital";
    }
    for (var i = 0; i < 96; i++) {
        if (btnType.text === "pwm" && pin[i].PWM == "yes") {
            hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
        }
        else if (pin[i].type === pinType) {
            hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
        }
    }
}

// button released after dragging, slider released
function release(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    var lenBar = bar.length;
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
    // releasing button on canvas
    if (btnStatus === "active") {
        document.removeEventListener('mousemove', activateBtn, false);
        if (x >= rectInner.x && x <= (rectInner.x + rectInner.w) && y >= rectInner.y && y <= rectInner.y + rectInner.h && btnCheck === true) {
            btn.push(new createBtn(snapPosPin.x, snapPosPin.y, btnType.text));
            drawBtn(75, 15, snapPosPin.x, snapPosPin.y, ctxBTN, btnType, btnType.s, btnType.text, 1, false);
            snapPosPin.y += btnHeight * 1.5;
            document.addEventListener('mousemove', selectPin, false);
            ctxBase.fillStyle = 'red';
            ctxBase.font = '12pt Andale Mono';
            ctxBase.fillText("select " + btnType.article, BBposX + 10, BBposY - 25);
            for (var i = 0; i < 96; i++) {
                if (btnType.text === "pwm" && pin[i].PWM == "yes") {
                    hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
                }
                else if (pin[i].type === pinType && pin[i].select === "off") {
                    hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
                }
            }
        }
        else {
            document.addEventListener('mousemove', btnInfo, false);
            document.addEventListener('mousedown', clickDown, false);
        }
        btnStatus = "none";
    }
    // sliding bar for frequency
    for (var i = 0; i < lenBar; i++) {
        if (bar[i].move === "on") {
            bar[i].move = 'off';
            document.removeEventListener('mousemove', slideBar, false);
        }
    }
};

// button on canvas, now user needs to select pin
function selectPin(event) {
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
    document.addEventListener('click', pinSelected, false);
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    var len = btn.length;
    var pinlen = pin.length;
    // drawLine(x,y,btn[len-1]);
    for (var i = 0; i < pinlen; i++) {
        if (btnType.text === "pwm" && pin[i].PWM == "yes") {
            hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
        }
        else if (pin[i].type === pinType && pin[i].select === "off") {
            hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
        }
        if (x >= pin[i].x && x <= pin[i].endX && y >= pin[i].y && y <= pin[i].endY && pin[i].select === "off") {
            if ((btnType.text === "pwm" && pin[i].PWM == "yes") || pin[i].type === pinType) {
                drawBtn(75, 15, btn[len - 1].x, btn[len - 1].y, ctxActive, btnType, pin[i].s,
                pin[i].id, 1, false);
                hover(pin[i].x, pin[i].y, pin[i].w, pin[i].h);
            }
        }
    }
};

function pinSelected(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    var pinlen = pin.length;
    var len = btn.length;
    var lenBar = bar.length;
    var selected;
    document.removeEventListener('mousemove', selectPin, false);
    document.addEventListener('mousemove', btnInfo, false);
    document.addEventListener('mousedown', clickDown, false);
    document.removeEventListener('click', pinSelected, false);
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
    ctxBase.fillStyle = "white";
    ctxBase.fillRect(BBposX, BBposY - 70, 230, 50);
    for (var i = 0; i < pinlen; i++) {
        if (x >= pin[i].x && x <= pin[i].endX && y >= pin[i].y && y <= pin[i].endY && pin[i].select === "off") {
            if ((btnType.text === "pwm" && pin[i].PWM == "yes") || pin[i].type === pinType) {
                drawBtn(75, 15, btn[len - 1].x, btn[len - 1].y, ctxBTN, btnType, pin[i].s,
                pin[i].id, 1, false);
                selected = true;
                btn[len - 1].pinNum = i;
                pin[i].btn = len - 1;
                pin[i].select = "on";
            }
        }
    }
    // if nothing selected
    if (selected != true) {
        if (btnType.input === "on") {
            ctxBase.fillStyle = 'red';
            ctxBase.font = '12pt Andale Mono';
            ctxBase.fillText("select " + btnType.article, BBposX + 10, BBposY - 25);
            document.addEventListener('mousemove', selectPin, false);
        }
        else {
            ctxBTN.fillStyle = 'rgb(225,225,225)';
            ctxBTN.fillRect(btn[len - 1].x - 2, btn[len - 1].y - 2, btnWidth + 2, btnHeight + 3);
            btn.splice(btn.length - 1, 1);
            snapPosPin.y = snapPosPin.y - btnHeight * 1.5;
        }
    }
    else {
        createCanvas(pin[btn[len - 1].pinNum]);
        if (btnType.text === "usr leds") {
            newPin = 'active';
            currentPin = btn[len - 1].pinNum;
            btn[len - 1].color = ledBTN.color;
            btn[len - 1].offColor = ledBTN.offColor;
            pin[btn[len - 1].pinNum].color = ledColor[0];
            ledColor.splice(0, 1);
            drawWireLEDs(pin[btn[len - 1].pinNum], len - 1);
            on(btn[len - 1]);
            bar[lenBar] = new createBar(len - 1, btn[len - 1].pinNum, btn[len - 1].color,
            ledBTN.barColor, "freq");
            btn[len - 1].bar = lenBar;
            drawBar();
        }
        else if (btnType.text === "analog") {
            newPin = 'active';
            currentPin = btn[len - 1].pinNum;
            pin[btn[len - 1].pinNum].color = analogColor[0];
            analogColor.splice(0, 1);
            btn[len - 1].color = analogBTN.color;
            btn[len - 1].offColor = analogBTN.offColor;
            drawWireAnalogPin(pin[btn[len - 1].pinNum], len - 1);
            on(btn[len - 1]);
        }
        else { // digital
            pin[btn[len - 1].pinNum].subType = btnType.text;
            if (btnType.text === "input") {
                pin[btn[len - 1].pinNum].color = inputColor[0];
                inputColor.splice(0, 1);
                drawWireDigitalPin(pin[btn[len - 1].pinNum], len - 1);
                //		 	    drawLED(pin[btn[len-1].pinNum]);
                btn[len - 1].color = inputBTN.color;
                btn[len - 1].offColor = inputBTN.offColor;
                on(btn[len - 1]);
                createOutput();
            }
            else if (btnType.text === "output") {
                pin[btn[len - 1].pinNum].color = outputColor[0];
                outputColor.splice(0, 1);
                drawWireDigitalPin(pin[btn[len - 1].pinNum], len - 1);
                newPin = 'active';
                btn[len - 1].color = outputBTN.color;
                btn[len - 1].offColor = outputBTN.offColor;
                if (btnType.input === "on") {
                    pin[btn[len - 2].pinNum].output = pin[btn[len - 1].pinNum].id;
                    pin[btn[len - 1].pinNum].input = "yes";
                    currentPin = btn[len - 2].pinNum;
                    outputBTN.input = "off";
                    // btn[len-1].input = pin[btn[len-2].pinNum].output
                }
                else {
                    on(btn[len - 1]);
                    pin[btn[len - 1].pinNum].input = "none";
                    currentPin = btn[len - 1].pinNum;
                    bar[lenBar] = new createBar(len - 1, btn[len - 1].pinNum, btn[len - 1].color,
                    outputBTN.barColor, "freq");
                    btn[len - 1].bar = lenBar;
                    drawBar();
                }
            }
            else {
                pin[btn[len - 1].pinNum].color = pwmColor[0];
                pwmColor.splice(0, 1);
                drawWireDigitalPin(pin[btn[len - 1].pinNum], len - 1);
                newPin = 'active';
                currentPin = btn[len - 1].pinNum;
                btn[len - 1].color = pwmBTN.color;
                btn[len - 1].offColor = pwmBTN.offColor;
                on(btn[len - 1]);
                bar[lenBar] = new createBar(len - 1, btn[len - 1].pinNum, btn[len - 1].color,
                pwmBTN.barColor, "PWM");
                btn[len - 1].bar = lenBar;
                drawBar();
            }
        }
        if (len === 1) {
            ctxGraph[0].fillStyle = "#FF4500";
            ctxGraph[0].beginPath();
            ctxGraph[0].moveTo(playBtn.x, playBtn.y);
            ctxGraph[0].lineTo(playBtn.x + 10, playBtn.y + 7);
            ctxGraph[0].lineTo(playBtn.x, playBtn.y + 14);
            ctxGraph[0].fill();
            record(event);
        }
    }
    drawToGraph(btn[len - 1]);
    clicked(event);
};

function createOutput() {
    document.removeEventListener('mousemove', btnInfo, false);
    document.removeEventListener('mousedown', clickDown, false);
    var len = btn.length;
    btn.push(new createBtn(btnX + 70, snapPosPin.y, btnType.text));
    drawBtn(75, 15, btnX + 70, snapPosPin.y, ctxBTN, outputBTN, 13, 'output', 1, false);
    drawLink(btn[len - 1], btn[len]);
    snapPosPin.y += btnHeight * 1.5;
    btnType = outputBTN;
    btnType.input = "on";
    ctxBase.fillStyle = 'red';
    ctxBase.font = '12pt Andale Mono';
    ctxBase.fillText("select " + btnType.article, BBposX + 10, BBposY - 25);
    document.addEventListener('mousemove', selectPin, false);
};

// *************************
// * LED/VOLTAGE FUNCTIONS *
// *************************

// draw LEDs		
function drawLED(led) {
    function doInputRead() {
        inputRead(led);
    }

    // clear canvas
    console.log('drawing led')
    var data = {
        freq: led.freq,
        power: led.power,
        id: led.id,
        num: led.num,
        state: led.HIGH,
        output: led.output,
        type: led.type,
        subType: led.subType
    };
    led.ctx.clearRect(0, 0, led.canvas.width, led.canvas.height);
    led.ctx.strokeStyle = ('rgb(245,245,245)');
    led.ctx.strokeRect(btn[led.btn].ledX, btn[led.btn].ledY, 5, 10);
    if (led.type === 'analog') {
        if (led.power === 'on') {
            ledLight(btn[led.btn].ledX, btn[led.btn].ledY, led.ctx)
        }
    }
    else if (led.subType === 'input') {
        console.log(led.input + ' ' + led.output);
        if (led.power === 'on') {
            ledLight(btn[led.btn].ledX, btn[led.btn].ledY, led.ctx)
            led.check = setInterval(doInputRead, 100);
            led.voltCurrent = 5;
        }
        else {
            clearInterval(led.check);
            led.voltCurrent = 0;
        }
    }
    else {
        if (led.type === "usr leds") {
            var i = led.number;
            USRcontext[i].clearRect(0, 0, USRcanvas[i].width, USRcanvas[i].height);
        }
        if (led.freq === 0 && led.power === 'on') {
            led.voltCurrent = 5;
            console.log(data.output);
            pinChange(data);
            if (led.type === "usr leds") {
                gradientLight(led.x, led.y, led.w, led.h, USRcontext[i]);
            }
            ledLight(btn[led.btn].ledX, btn[led.btn].ledY, led.ctx);
        }
        else if (led.power === 'on') {
            if (led.subType != "pwm") {
                if (led.HIGH === 0) {
                    led.HIGH = 1;
                    if (led.type === "usr leds") {
                        gradientLight(led.x, led.y, led.w, led.h, USRcontext[i]);
                    }
                    ledLight(btn[led.btn].ledX, btn[led.btn].ledY, led.ctx)
                    led.voltCurrent = 5;
                    pinChange(data);
                }
                else {
                    led.HIGH = 0;
                    led.voltCurrent = 0;
                    pinChange(data);
                }
            }
            else {
                pinChange(data);
                ledLight(btn[led.btn].ledX, btn[led.btn].ledY, led.ctx)
            }
        }
        else {
            pinChange(data);
            led.voltCurrent = 0;
        }
    }
};

// make LED blink	
function blink(pin) {
    clearInterval(pin.blinking);
    pin.blinking = setInterval(function() {
        drawLED(pin)
    }, pin.freq);
};

function getVoltage(pin) {
    if (pin.type === "analog") {
        var data = {
            num: pin.num,
            id: pin.id,
            power: pin.power
        };
        pin.getVoltage = setInterval(function() {
            start(data)
        }, 50);
    }
    else if (pin.subType === "pwm") {
        pin.counter = 0;
        pin.getVoltage = setInterval(function() {
            pwmCycle(pin)
        }, 50);
    }
    else {
        pin.getVoltage = setInterval(function() {
            addVoltage(pin)
        }, 50);
    }
};

function addVoltage(pin) {
    pin.volt.push(pin.voltCurrent);
};

function pwmCycle(pin) {
    if (pin.power === "on") {
        pin.volt.push(5 * pin.freq);
    }
    else {
        pin.volt.push(0);
    };
}

function zeroVolt(data) {
    pin[data.num].volt.push(0);
}

function inputRead(pin) {
    console.log('here')
    var data = {
        id: pin.id,
        output: pin.output
    };
    checkInput(data);
}

// ********************
// * SLIDER FUNCTIONS * --> also in mousedown and mouseup functions
// ********************

//  moves slider
function slideBar(event) {
    var coord = Position(event);
    var x = coord[0];
    var y = coord[1];
    var i;
    var len = bar.length;
    for (i = 0; i < len; i++) {
        if (bar[i].move === 'on') {
            bar[i].sliderX = x - 5;
            if (bar[i].sliderX < bar[i].barLocX + 2) {
                bar[i].sliderX = bar[i].barLocX + 2;
                bar[i].frequency = 0;
            }
            else if (bar[i].sliderX > bar[i].barLength + bar[i].barLocX - 12) {
                bar[i].sliderX = bar[i].barLength + bar[i].barLocX - 12;
                if (bar[i].type === "PWM") {
                    bar[i].frequency = 1;
                }
                else {
                    bar[i].frequency = 10;
                }
            }
            else {
                if (bar[i].type === "PWM") {
                    bar[i].frequency = ((bar[i].sliderX - bar[i].barLocX - 2) / 140).toPrecision(2);
                }
                else {
                    bar[i].frequency = ((bar[i].sliderX - bar[i].barLocX - 2) / 14).toPrecision(2);
                }
            }
            if (bar[i].type === "PWM") {
                pin[bar[i].pin].freq = bar[i].frequency;
                bar[i].text = bar[i].frequency.toString();
            }
            else {
                pin[bar[i].pin].freq = bar[i].frequency * 1000;
                bar[i].text = bar[i].frequency.toString() + ' s';
            }
            drawBar();
            if (pin[bar[i].pin].freq != 0 && pin[bar[i].pin].power === 'on') {
                blink(pin[bar[i].pin]);
            }
            else if (pin[bar[i].pin].power === 'on') {
                drawLED(pin[bar[i].pin]);
                var data = {
                    freq: pin[bar[i].pin].freq,
                    power: pin[bar[i].pin].power,
                    id: pin[bar[i].pin].id,
                    num: pin[bar[i].pin].num,
                    state: pin[bar[i].pin].HIGH,
                    output: pin[bar[i].pin].output,
                    type: pin[bar[i].pin].type,
                    subType: pin[bar[i].pin].subType
                };
                // call socket; turn on with no blinking
            }
        }
    }
}

// *******************
// * GRAPH FUNCTIONS *
// *******************

// plot the given point
function plot(xPoint, yPoint, pin) {
    var coord = scale(xPoint, yPoint);
    var x = zeroX + coord[0];
    var y = zeroY - coord[1];
    pin.ctxGraph.beginPath();
    pin.ctxGraph.moveTo(prevPoint[0], prevPoint[1]);
    pin.ctxGraph.lineTo(x, y);
    pin.ctxGraph.strokeStyle = pin.color;
    pin.ctxGraph.lineWidth = 2;
    pin.ctxGraph.stroke();
    prevPoint = [x, y];
};

// scale the point to reflect zoom
function scale(x, y) {
    var xPoint = x * xScale;
    var yPoint = y * yScale / zoom;
    var coord = [xPoint, yPoint];
    return coord;
};

// redraw the canvasGraph with zoom
function zooming(event) {
    ctxGraph[0].clearRect(0, 0, canvasGraph[0].width, canvasGraph[0].height);
    drawGraph();
    document.removeEventListener('mouseup', zooming, false);
};

// start recording data
function setTimer() {
    status = "on";
    interval = 0;
    timeCount = 0; //voltage = []; voltCount = 0;
    timeValues = [];
    timer = setInterval(play, 50);
};

// collect each point for  the given interval
function play() {
    //     var pinlen = analogPin.length;
    //     for(i=0;i<pinlen; i++){
    //         if (analogPin[i].power==="on"){ //***********************************************
    // 	    start(analogPin[i].id);
    //         }
    //     }
    ctxGraph[0].clearRect(0, 0, canvasGraph[0].width, canvasGraph[0].height);
    var len = timeValues.length;
    timeValues[len] = timeCount / 100;
    timeCount += 5;
    drawGraph();
    if (timeCount > 375) {
        interval += 5;
    }
};

// stop the timer
function stop(event) {
    if (status != "off") {
        status = "off";
        clearInterval(timer);
        ctxGraph[0].clearRect(0, 0, canvasGraph[0].width, canvasGraph[0].height);
        drawGraph();
    }
    ctxGraph[0].clearRect(0, 0, canvasGraph[0].width, canvasGraph[0].height);
    drawGraph();
    document.removeEventListener('mouseup', stop, false);
};

// only record data if not already on
function record(event) {
    if (status != "on") {
        setTimer();
    }
    else {
        //	drawGraph();
    }
    document.removeEventListener('mouseup', record, false);
};

// change zoom level
function zoomChange(dir) {
    if (dir === "out") {
        if (zoomIndex < 3) {
            zoomIndex += 1;
            zoom = zoomVal[zoomIndex];
        }
    }
    if (dir === "in") {
        if (zoomIndex > 0) {
            zoomIndex -= 1;
            zoom = zoomVal[zoomIndex];
        }
    }
};
// ******************
// * CREATE OBJECTS *
// ******************

// buttons
function createBtn(x, y, type) {
    this.LED = false;
    this.x = x;
    this.y = y;
    this.w = 75;
    this.h = 15;
    this.type = type;
    this.xOnOff = btnX + btnWidth - 5;
    this.yOnOff = y;
    this.ledX = x - 10;
    this.ledY = y + 2.5;
    this.status = "off";
    this.name;
    return;
};

// user light properties
function createUSR(x, y, number, id) {
    this.x = x;
    this.y = y;
    this.w = 11.25;
    this.h = 18;
    this.endX = (this.x + 11.2);
    this.endY = (this.y + 18);
    this.power = 'on';
    this.number = number;
    this.freq = 0;
    this.select = "off";
    this.volt = [];
    this.HIGH = 1;
    this.id = id;
    this.blinking = 0;
    this.pinSelect = 'off';
    this.type = 'usr leds';
    this.s = 22;
    this.time = [];
    return;
};

// slider bar properties, not necessarily connected to led
function createBar(button, pin, outline, barColor, type) {
    this.barLocX = btnX + btnWidth + 70;
    this.barLocY = btn[button].y;
    this.btn = button;
    this.barLength = 154;
    this.barHeight = 15;
    this.sliderX = (this.barLocX + 2);
    this.sliderY = (this.barLocY + 2);
    this.frequency = (this.sliderX - this.barLocX - 2);
    this.move = 'off';
    this.pin = pin;
    this.outline = outline;
    this.barColor = barColor;
    this.type = type;
    if (type === "PWM") {
        this.text = (this.frequency.toString());
    }
    else {
        this.text = (this.frequency.toString() + ' s');
    };
    return;
};

// pins on beaglebone
function createPin(x, y, id, type, num) {
    this.x = x;
    this.y = y;
    this.w = 8;
    this.h = 8;
    this.endX = x + 8;
    this.endY = y + 7;
    this.id = id;
    this.select = "off";
    this.type = type;
    this.freq = 0;
    this.power = "on";
    this.subType = "none";
    this.num = num;
    this.s = 18;
    this.HIGH = 1;
    this.volt = [];
    this.time = [];
    return;
};

//// pins on breadboard --> hasn't been implemented yet
//// function createBreadBPin(x,y,id){
//// 	this.x = x; this.y = y; this.w = 5; this.h = 5; this.id; this.endX = x+5; 
//// 	this.endY = y + 5; return;
//// };
//
//
// *************************
// * ALL DRAWING FUNCTIONS *
// *************************


function welcomeMessage(color) {
    ctxActive.fillStyle = 'rgba(255,255,255,.5)';
    ctxActive.fillRect(0, 0, canvasBase.width, canvasBase.height);
    ctxActive.fillStyle = 'rgba(0,102,204,.85)';
    ctxActive.fillRect(canvasBase.width / 4, canvasBase.height / 4,
    canvasBase.width / 2, canvasBase.height / 2);
    ctxActive.fillStyle = color;
    ctxActive.font = '12pt Andale Mono';
    ctxActive.fillText('X', canvasBase.width * 6 / 8 - 20, canvasBase.height / 4 + 20);
    ctxActive.fillStyle = 'white';
    ctxActive.font = '13pt Andale Mono';
    ctxActive.fillText('Welcome to the beaglebone user interface!', canvasBase.width / 4 + 20, canvasBase.height / 4 + 25);
    ctxActive.font = '10pt Andale Mono';
    ctxActive.fillText('This interface allows you to play with analog to digital converters,', canvasBase.width / 4 + 25, canvasBase.height / 4 + 55);
    ctxActive.fillText('digital pins (including inputs, outputs, and pwms), and the user leds', canvasBase.width / 4 + 25, canvasBase.height / 4 + 70);
    ctxActive.fillText('located at the top of the board. Hovering over the buttons indicates', canvasBase.width / 4 + 25, canvasBase.height / 4 + 85);
    ctxActive.fillText('which pins correspond to what type. Click and drag the button within', canvasBase.width / 4 + 25, canvasBase.height / 4 + 100);
    ctxActive.fillText('the white rectangle and select a pin. The input button requires both an', canvasBase.width / 4 + 25, canvasBase.height / 4 + 115);
    ctxActive.fillText('input and an output. The graph to the right will display the voltage', canvasBase.width / 4 + 25, canvasBase.height / 4 + 130);
    ctxActive.fillText('of the corresponding pin. Use the zoom in or zoom out to alter the graph,', canvasBase.width / 4 + 25, canvasBase.height / 4 + 145);
    ctxActive.fillText('stop to stop recording voltages, and play again to reset. Enjoy!', canvasBase.width / 4 + 25, canvasBase.height / 4 + 160);
    document.addEventListener('click', exit, false);
    document.addEventListener('mousemove', exitHover, false);
}

// initial drawing buttons at top   
function drawButtons() {
    roundRect(analogBTN, 75, 15, 1, ctxBase, false);
    roundRect(digitalBTN, 75, 15, 1, ctxBase, false);
    roundRect(gndBTN, 75, 15, 1, ctxBase, false);
    roundRect(powerBTN, 75, 15, 1, ctxBase, false);
    roundRect(ledBTN, 75, 15, 1, ctxBase, false);
};

function roundRect(btn, w, h, radius, context, stroke) {
    var x = btn.x;
    var y = btn.y;
    var color = btn.color;
    var text = btn.text;
    var s = btn.s;
    var r = x + w;
    var b = y + h;
    context.beginPath();
    context.lineWidth = "1";
    context.moveTo(x + radius, y);
    context.lineTo(r - radius, y);
    context.quadraticCurveTo(r, y, r, y + radius);
    context.lineTo(r, y + h - radius);
    context.quadraticCurveTo(r, b, r - radius, b);
    context.lineTo(x + radius, b);
    context.quadraticCurveTo(x, b, x, b - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    if (stroke === true) {
        context.strokeStyle = color;
        context.stroke();
        context.fillStyle = 'white';
        context.fill();
        context.fillStyle = color;
    }
    else {
        context.strokeStyle = color;
        context.stroke();
        context.fillStyle = color;
        context.fill()
        context.fillStyle = 'white';
    };
    context.font = '10pt Andale Mono';
    context.fillText(text, x + s, y + 12);
}
// draw individual button while dragging and then permanently on different canvas
function drawBtn(w, h, x, y, context, btn, s, text, radius, stroke) {
    var color = btn.color;
    var r = x + w;
    var b = y + h;
    context.beginPath();
    context.lineWidth = "1";
    context.moveTo(x + radius, y);
    context.lineTo(r - radius, y);
    context.quadraticCurveTo(r, y, r, y + radius);
    context.lineTo(r, y + h - radius);
    context.quadraticCurveTo(r, b, r - radius, b);
    context.lineTo(x + radius, b);
    context.quadraticCurveTo(x, b, x, b - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    if (stroke === true) {
        context.strokeStyle = color;
        context.stroke();
        context.fillStyle = 'white';
        context.fill();
        context.fillStyle = color;
    }
    else {
        context.strokeStyle = color;
        context.stroke();
        context.fillStyle = color;
        context.fill()
        context.fillStyle = 'white';
    };
    context.font = '10pt Andale Mono';
    context.fillText(text, x + s, y + 12);
};

function hover(x, y, w, h) {
    ctxActive.fillStyle = 'RGBA(255,255,255,.5)';
    ctxActive.fillRect(x, y, w, h);
};

// draw slider bars                       
function drawBar() {
    var len = bar.length;
    ctxBar.clearRect(0, 0, canvasBar.width, canvasBar.height);
    for (var i = 0; i < len; i++) {
        ctxBar.fillStyle = 'rgb(205,205,205)';
        ctxBar.fillRect(bar[i].barLocX, bar[i].barLocY, bar[i].barLength, bar[i].barHeight);
        ctxBar.fillStyle = bar[i].barColor;
        ctxBar.fillRect(bar[i].barLocX, bar[i].barLocY, bar[i].sliderX - bar[i].barLocX, 15);
        ctxBar.fillStyle = 'rgb(30,30,30)';
        ctxBar.fillRect(bar[i].sliderX - 2, bar[i].barLocY, 14, 15);
        ctxBar.strokeStyle = bar[i].outline;
        ctxBar.lineWidth = 2;
        ctxBar.strokeRect(bar[i].barLocX, bar[i].barLocY, bar[i].barLength, bar[i].barHeight);
        ctxBar.fillStyle = 'black';
        ctxBar.strokeStyle = 'rgb(225,225,225)';
        ctxBar.lineWidth = 6;
        ctxBar.font = '12pt Andale Mono';
        ctxBar.strokeText(bar[i].text, bar[i].barLength + bar[i].barLocX + 10,
        bar[i].barHeight + bar[i].barLocY - 2);
        ctxBar.fillText(bar[i].text, bar[i].barLength + bar[i].barLocX + 10,
        bar[i].barHeight + bar[i].barLocY - 2);
    }
};


// draw line from button to pin/LED while selecting pin, make this the same as the wire
function drawLine(x, y, button) {
    ctxActive.clearRect(0, 0, canvasActive.width, canvasActive.height);
    ctxActive.beginPath();
    ctxActive.moveTo(button.x + button.w, button.y + button.h / 2);
    ctxActive.lineTo(x, y);
    ctxActive.strokeStyle = '#ff0000';
    ctxActive.lineWidth = 2;
    ctxActive.stroke();
};

// draw wire from switch/slider to pin/LED once selected
function drawWireLEDs(pin, i) {
    ctxBTN.beginPath();
    ctxBTN.moveTo(btn[i].x + 75, btn[i].y + btnHeight * 0.5);
    ctxBTN.lineTo(rect.x + rectInner.w + 12, btn[i].y + btnHeight * 0.5);
    ctxBTN.lineTo(rect.x + rectInner.w + 12, rect.y + 10);
    ctxBTN.lineTo(pin.x + (pin.endX - pin.x) / 2, rect.y + 10);
    ctxBTN.lineTo(pin.x + (pin.endX - pin.x) / 2, pin.y);
    ctxBTN.strokeStyle = pin.color;
    ctxBTN.lineWidth = 2;
    ctxBTN.stroke();
};

// draw wire from button to pin
function drawWireAnalogPin(pin, i) {
    ctxBTN.beginPath();
    ctxBTN.moveTo(btn[i].x + 75, btn[i].y + btnHeight * 0.5);
    ctxBTN.lineTo(rect.x + rectInner.w + 10, btn[i].y + btnHeight * 0.5);
    ctxBTN.lineTo(rect.x + rectInner.w + 10, pin.y + pin.h / 2);
    ctxBTN.lineTo(pin.x + pin.w / 2, pin.y + pin.h / 2);
    ctxBTN.lineWidth = 2;
    ctxBTN.strokeStyle = pin.color;
    ctxBTN.stroke();
};

function drawWireDigitalPin(pin, i) {
    ctxBTN.beginPath();
    if (pin.subType == "input") {
        var s = -2;
    }
    else if (pin.subType == "output") {
        var s = -6;
    }
    else {
        var s = -4;
    }
    ctxBTN.strokeStyle = pin.color;
    ctxBTN.moveTo(btn[i].x + 75, btn[i].y + btnHeight * 0.5);
    ctxBTN.lineTo(rect.x + rectInner.w + 10 + s, btn[i].y + btnHeight * 0.5);
    ctxBTN.lineTo(rect.x + rectInner.w + 10 + s, pin.y + pin.h / 2);
    ctxBTN.lineTo(pin.x + pin.w / 2, pin.y + pin.h / 2);
    ctxBTN.lineWidth = 2;
    ctxBTN.stroke();
};

function drawLink(btn1, btn2, pin) {
    ctxBTN.beginPath();
    ctxBTN.moveTo(btn1.x + btn1.w / 2, btn1.y + btnHeight);
    ctxBTN.lineTo(btn1.x + btn1.w / 2, btn2.y + btnHeight * 0.5);
    ctxBTN.lineTo(btn2.x, btn2.y + btnHeight * 0.5);
    ctxBTN.strokeStyle = 'rgb(0,153,110)';
    ctxBTN.lineWidth = 2;
    ctxBTN.stroke();
};

function drawToGraph(btn) {
    ctxBTN.beginPath();
    ctxBTN.moveTo(BBposX + 309, graphLinePos);
    ctxBTN.lineTo(BBposX + 340, graphLinePos);
    ctxBTN.strokeStyle = pin[btn.pinNum].color;
    ctxBTN.lineWidth = 2;
    ctxBTN.stroke();
    graphLinePos += 4;
};

// USR led lights
function gradientLight(xstart, ystart, width, height, context) {
    var x1 = xstart + width / 2; // x of 1. circle center point
    var y1 = ystart + height / 2; // y of 1. circle center point
    var r1 = 0.1; // radius of 1. circle
    var x2 = x1; // x of 2. circle center point
    var y2 = y1; // y of 2. circle center point
    var r2 = 10; // radius of 2. circle
    var radialGradient = context.createRadialGradient(x1, y1, r1, x2, y2, r2);
    context.save();
    context.translate(x1, y1);
    context.scale(1, 2);
    context.translate(-x1, - y1);
    radialGradient.addColorStop(0, 'rgba(0,  225, 255, 1)');
    radialGradient.addColorStop(.3, 'rgba(0,  125, 255, .7)');
    radialGradient.addColorStop(.5, 'rgba(0,  0, 255, .5)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
    context.fillStyle = radialGradient;
    context.fillRect(xstart, ystart, width, height);
    context.restore();
};

// on switch    	 	
function on(btn) {
    var x = btn.xOnOff;
    var y = btn.yOnOff;
    var color = btn.color;
    var w = 50;
    var h = 15;
    var offColor = btn.offColor;
    var r = x + w;
    var b = y + h;
    var radius = 1;
    ctxBTN.beginPath();
    ctxBTN.lineWidth = "1";
    ctxBTN.moveTo(x + radius, y);
    ctxBTN.lineTo(r - radius, y);
    ctxBTN.quadraticCurveTo(r, y, r, y + radius);
    ctxBTN.lineTo(r, y + h - radius);
    ctxBTN.quadraticCurveTo(r, b, r - radius, b);
    ctxBTN.lineTo(x + radius, b);
    ctxBTN.quadraticCurveTo(x, b, x, b - radius);
    ctxBTN.lineTo(x, y + radius);
    ctxBTN.quadraticCurveTo(x, y, x + radius, y);
    ctxBTN.strokeStyle = color;
    ctxBTN.stroke();
    ctxBTN.fillStyle = color;
    ctxBTN.fill()
    ctxBTN.fillStyle = 'white';
    ctxBTN.font = '10pt Andale Mono';
    ctxBTN.fillText('on', x + 4, y + 12);
    ctxBTN.beginPath();
    ctxBTN.moveTo(x + w / 2, y);
    ctxBTN.lineTo(r - radius, y);
    ctxBTN.quadraticCurveTo(r, y, r, y + radius);
    ctxBTN.lineTo(r, y + h - radius);
    ctxBTN.quadraticCurveTo(r, b, r - radius, b);
    ctxBTN.lineTo(x + w / 2, b);
    ctxBTN.fillStyle = offColor;
    ctxBTN.fill()
    ctxBTN.fillStyle = 'black';
    ctxBTN.font = '10pt Andale Mono';
    ctxBTN.fillText('off', x + 26, y + 12);
};

// off switch
function off(btn) {
    var x = btn.xOnOff;
    var y = btn.yOnOff;
    var color = btn.color;
    var w = 50;
    var h = 15;
    var offColor = btn.offColor;
    var r = x + w;
    var b = y + h;
    var radius = 1;
    ctxBTN.beginPath();
    ctxBTN.lineWidth = "1";
    ctxBTN.moveTo(x + radius, y);
    ctxBTN.lineTo(r - radius, y);
    ctxBTN.quadraticCurveTo(r, y, r, y + radius);
    ctxBTN.lineTo(r, y + h - radius);
    ctxBTN.quadraticCurveTo(r, b, r - radius, b);
    ctxBTN.lineTo(x + radius, b);
    ctxBTN.quadraticCurveTo(x, b, x, b - radius);
    ctxBTN.lineTo(x, y + radius);
    ctxBTN.quadraticCurveTo(x, y, x + radius, y);
    ctxBTN.strokeStyle = color;
    ctxBTN.stroke();
    ctxBTN.fillStyle = color;
    ctxBTN.fill()
    ctxBTN.beginPath();
    ctxBTN.moveTo(x + w / 2, b);
    ctxBTN.lineTo(x + radius, b);
    ctxBTN.quadraticCurveTo(x, b, x, b - radius);
    ctxBTN.lineTo(x, y + radius);
    ctxBTN.quadraticCurveTo(x, y, x + radius, y);
    ctxBTN.lineTo(x + w / 2, y);
    ctxBTN.fillStyle = offColor;
    ctxBTN.fill();
    ctxBTN.fillStyle = 'black';
    ctxBTN.font = '10pt Andale Mono';
    ctxBTN.fillText('on', x + 5, y + 12);
    ctxBTN.fillStyle = 'white';
    ctxBTN.font = '10pt Andale Mono';
    ctxBTN.fillText('off', x + 26, y + 12);
};

function drawXs() {
    var len = btn.length;
    for (var i = 0; i < len; i++) {
        ctxActive.fillStyle = 'white';
        ctxActive.font = '12pt Arial';
        ctxActive.fillText('X', btn[i].x - 19, btn[i].y + 16);
    }
};

function ledLight(x, y, ctx) {
    var x1 = x + 2.5; // x of 1. circle center point
    var y1 = y + 5; // y of 1. circle center point
    var r1 = 0.1; // radius of 1. circle
    var x2 = x1; // x of 2. circle center point
    var y2 = y1; // y of 2. circle center point
    var r2 = 15; // radius of 2. circle
    var radialGradient = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    radialGradient.addColorStop(0, 'rgba(0,  225, 255, 1)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(x, y, 5, 10);
};


// ***************************
// * GRAPH DRAWING FUNCTIONS *
// ***************************

// draw x axis
function xAxis() {
    ctxGraph[0].moveTo(axisStartX, axisStartY + 200);
    ctxGraph[0].lineTo(axisStartX + 375, axisStartY + 200);
    ctxGraph[0].strokeStyle = "black";
    ctxGraph[0].lineWidth = 2;
    ctxGraph[0].stroke();
    ctxGraph[0].strokeStyle = "black";
    ctxGraph[0].font = '12pt Lucinda Grande';
    ctxGraph[0].fillText('Time [s]', axisStartX + 175, axisStartY + 449);
    ctxGraph[0].save();
    xTicks();
};

// draw x tick marks, take into account the interval if timer on 
function xTicks() {
    var x = 0;
    var countX = 0;
    var xnum = 95;
    var time = 1;
    var prec = Math.ceil(Math.log(Math.abs(interval) / 100 + 1.1) / Math.LN10) + 1;
    ctxGraph[0].strokeStyle = "black";
    while (x <= xWidth + interval) {
        if (axisStartX + x - interval >= zeroX) {
            if (countX % 10 === 0) {
                ctxGraph[0].beginPath();
                ctxGraph[0].moveTo(axisStartX + x - interval, axisStartY + 195);
                ctxGraph[0].lineTo(axisStartX + x - interval, axisStartY + 210);
                ctxGraph[0].lineWidth = 2;
                ctxGraph[0].stroke();
            }
            else {
                ctxGraph[0].beginPath();
                ctxGraph[0].moveTo(axisStartX + x - interval, axisStartY + 195);
                ctxGraph[0].lineTo(axisStartX + x - interval, axisStartY + 205);
                ctxGraph[0].lineWidth = 2;
                ctxGraph[0].stroke();
            }
        }
        x += 10;
        countX += 1;
    };
    ctxGraph[0].fillStyle = "black";
    ctxGraph[0].font = '8pt Lucinda Grande';
    while (xnum <= xWidth + interval) {
        if (axisStartX + xnum - interval >= zeroX) {
            ctxGraph[0].fillText(time.toPrecision(prec).toString(),
            axisStartX + xnum - interval, axisStartY + 220);
        }
        xnum += 100;
        time = (xnum + 3) / 100;
    };
};

// y axis
function yAxis() {
    var y = 0;
    var countY = 0;
    var ynum = 4;
    var volt = 5;
    var text;
    ctxGraph[0].beginPath();
    ctxGraph[0].moveTo(axisStartX, axisStartY);
    ctxGraph[0].lineTo(axisStartX, axisStartY + 400);
    ctxGraph[0].strokeStyle = "black";
    ctxGraph[0].lineWidth = 2;
    ctxGraph[0].stroke();
    ctxGraph[0].save();
    ctxGraph[0].font = '12pt Lucinda Grande';
    ctxGraph[0].translate(canvasGraph[0].width / 2, canvasGraph[0].height / 2);
    ctxGraph[0].rotate(-0.5 * Math.PI);
    ctxGraph[0].translate(-canvasGraph[0].width / 2, - canvasGraph[0].height / 2);
    ctxGraph[0].strokeStyle = "black";
    ctxGraph[0].fillText('Voltage', axisStartX - 240, axisStartY + 380);
    ctxGraph[0].restore();
    while (y <= yWidth) {
        if (countY % 2 === 0) {
            ctxGraph[0].beginPath();
            ctxGraph[0].moveTo(axisStartX - 10, axisStartY + y);
            ctxGraph[0].lineTo(axisStartX + 5, axisStartY + y);
            ctxGraph[0].lineWidth = 2;
            ctxGraph[0].stroke();
        }
        else {
            ctxGraph[0].beginPath();
            ctxGraph[0].moveTo(axisStartX - 5, axisStartY + y);
            ctxGraph[0].lineTo(axisStartX + 5, axisStartY + y);
            ctxGraph[0].lineWidth = 2;
            ctxGraph[0].stroke();
        }
        y += 10;
        countY += 1;
    };
    ctxGraph[0].fillStyle = "black";
    ctxGraph[0].font = '8pt Lucinda Grande';
    while (ynum <= yWidth + 4) {
        text = (volt * zoom).toPrecision(2).toString();
        if (volt < 0) {
            ctxGraph[0].fillText(text, axisStartX - 36, axisStartY + ynum);
        }
        else {
            ctxGraph[0].fillText(text.toString(), axisStartX - 32, axisStartY + ynum);
        }
        ynum += 20;
        volt -= 2 * 5 / 20;
    };
};

// draw both axis
function drawAxis() {
    yAxis();
    xAxis();
};

// draw the zoom in/out, play, and stop button
function drawGraphBtn() {
    ctxGraph[0].fillStyle = "black";
    ctxGraph[0].font = 'bold 21pt Lucinda Grande';
    // zoom in
    ctxGraph[0].fillText("+", plus.x, plus.y);
    ctxGraph[0].font = '30pt Lucinda Grande';
    // zoom out
    ctxGraph[0].fillText("-", minus.x, minus.y);
    ctxGraph[0].fillStyle = "black";
    ctxGraph[0].font = '14pt Lucinda Grande';
    // playBtn button
    ctxGraph[0].save();
    if (status === "on") {
        ctxGraph[0].fillStyle = "#FF4500";
    }
    else {
        ctxGraph[0].fillStyle = "black"
    }
    ctxGraph[0].beginPath();
    ctxGraph[0].moveTo(playBtn.x, playBtn.y);
    ctxGraph[0].lineTo(playBtn.x + 10, playBtn.y + 7);
    ctxGraph[0].lineTo(playBtn.x, playBtn.y + 14);
    ctxGraph[0].fill();
    ctxGraph[0].restore();
    // stopBtn button
    ctxGraph[0].save();
    if (status === "off") {
        ctxGraph[0].fillStyle = "#FF4500";
    }
    else {
        ctxGraph[0].fillStyle = "black"
    }
    ctxGraph[0].beginPath();
    ctxGraph[0].moveTo(stopBtn.x, stopBtn.y);
    ctxGraph[0].lineTo(stopBtn.x + 12, stopBtn.y);
    ctxGraph[0].lineTo(stopBtn.x + 12, stopBtn.y + 12);
    ctxGraph[0].lineTo(stopBtn.x, stopBtn.y + 12);
    ctxGraph[0].fill();
    ctxGraph[0].restore();
};

// draw all components
function drawGraph() {
    //console.time("draw graph");
    var pinlen = voltagePin.length;
    var spliced = 'false';
    for (var i = 0; i < pinlen; i++) {
        pin[voltagePin[i]].ctxGraph.clearRect(0, 0, pin[voltagePin[i]].canvasGraph.width,
        pin[voltagePin[i]].canvasGraph.height);
        pin[voltagePin[i]].time = timeValues;
        if (timeCount <= 375 && (timeValues.length > pin[voltagePin[i]].volt.length) && status === "on") {
            pin[voltagePin[i]].time = timeValues.slice(timeValues.length - pin[voltagePin[i]].volt.length);
        }
        else if (timeCount <= 375 && (timeValues.length < pin[voltagePin[i]].volt.length) && status === "on") {
            pin[voltagePin[i]].volt = pin[voltagePin[i]].volt.slice(pin[voltagePin[i]].volt.length - timeValues.length);
        }
        else if (timeCount > 375 && status === "on") {
            if (spliced === "false") {
                timeValues.splice(0, 1);
                spliced = "true";
            }
            if (pin[voltagePin[i]].volt.length < timeValues.length) {
                pin[voltagePin[i]].time = timeValues.slice(timeValues.length - pin[voltagePin[i]].volt.length);
            }
            else {
                pin[voltagePin[i]].volt.splice(0, 1);
                pin[voltagePin[i]].time = timeValues;
            }
        }
    }
    for (var j = 0; j < pinlen; j++) {
        prevPoint = 0;
        var timeTemp = [];
        var len = pin[voltagePin[j]].volt.length;
        for (var i = 0; i < len; i++) {
            if (timeCount > 375) {
                timeTemp[i] = pin[voltagePin[j]].time[i] - timeValues[0];
                plot(timeTemp[i], pin[voltagePin[j]].volt[i], pin[voltagePin[j]]);
            }
            else {
                plot(pin[voltagePin[j]].time[i], pin[voltagePin[j]].volt[i],
                pin[voltagePin[j]]);
            }
        }
    }

    drawGraphBtn();
    drawAxis();
    //console.timeEnd("draw graph");
};