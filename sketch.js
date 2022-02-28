// window
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let DIM = Math.min(WIDTH, HEIGHT);
let BASEDIM = 1000;

// randomness
let SEED;
let NOISESEED; // FIXED NOISESEED!

// global variables
var t = 0;
let delta = 0.001;
let offsetPx;

// params
let params = [];
let spins = 100;
let opacity = 20;
let noiseDelta = 10;
let smoothFactor = 1;


// proportion
let φ = (x) => (x * DIM / BASEDIM);
let phi = φ;

// training
let net;
let trainingData = [];

// setup
function setup() {
  createCanvas(DIM, DIM);
  noFill();
  stroke(255);
  strokeWeight(φ(1));
  background(0);
  noLoop();
  strokeCap(SQUARE);
  
  // seed
  let seed = SEED !== undefined? SEED : int(random(1, 100000));
  console.log('seed = %f', seed);
  randomSeed(seed);

  let nSeed = NOISESEED !== undefined? NOISESEED : int(random(1, 10000));
  console.log('noiseSeed = %f', nSeed);
  noiseSeed(nSeed);

  // constants
  offsetPx = phi(300);

  // params
  rollParams();

  // button 1
  button = createButton('Cute');
  button.position(1000, 0);
  button.mousePressed(classify(true));

  // button 2
  button = createButton('Ugly');
  button.position(1050, 0);
  button.mousePressed(classify(false));

  // button 3
  button = createButton('Same params');
  button.position(1000, 25);
  button.mousePressed(newSunset);
}

function rollParams() {
  params = [random(-100, 100), random(-100, 100), random(-100, 100), random(-100, 100), random(-100, 100), random(-100, 100), random(-100, 100), random(-100, 100)];
  spins = random(1000, 3200);
  opacity = random(10, 50);
  console.log(JSON.stringify(getParams()));
  return getParams();
}

function getParams() {
  return [...params, spins, opacity, delta];
}

function classify(cute) {
  let output = cute? [1] : [0];
  return function() {
    let dataPoint = {
      input: getParams(),
      output: output,
    };
    trainingData.push(dataPoint);
    net = new brain.NeuralNetwork({
      activation: 'tanh',
      hiddenLayers: [7, 7],
      iterations: 20000,
      learningRate: 0.5 // global learning rate, useful when training using streams
    });
    net.train(trainingData);
    next();
  }
}

function next() {
  let rating = 0;
  if (trainingData.length > 0) {
    for (let i = 0; i < 100; i++) {
      let p = rollParams();
      let out = net.run(p);
      rating = out[0];
      console.log(i, rating);
      if (rating > 0.5) break;
    }
  }
  newSunset();
}

// draw
function draw() {
  next();
}

// download
function keyTyped() {
  if (key === 's') {
    save();
  }
}

// create a single bezier
function plan1(P1, P2, P3, P4, P5, P6, P7, P8) {
  return  [(DIM + offsetPx) * noise(t + P1) - offsetPx/2,
          DIM * noise(t + P2),
          DIM * noise(t + P3),
          (DIM + offsetPx) * noise(t + P4) - offsetPx/2,
          (DIM + offsetPx) * noise(t + P5) - offsetPx/2,
          DIM * noise(t + P6),
          DIM * noise(t + P7),
          (DIM + offsetPx) * noise(t + P8) - offsetPx/2];
}

// create a lot of beziers
function newSunset() {
  background(0);
  for (let i = 0; i < spins; i++) { 
    plan = plan1(...params);
    var r = 255 * noise(t + 10);
    var g = 255 * noise(t + 20);
    var b = 255 * noise(t + 102);
    stroke(r, g, b, opacity);
    strokeWeight(phi(2));
    bezier(plan[0], plan[4], plan[1], plan[5], plan[2], plan[6], plan[3], plan[7]);
    t += delta;
  }
}