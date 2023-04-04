randomChoice = (array) => {
  if (array.length === 0) {
    return
  }
  if (array[0].weight === undefined || Array.isArray(array[0])) {
    return array[Math.floor(array.length * Math.random())]
  } else {
    // First, we loop the main dataset to count up the total weight. We're starting the counter at one because the upper boundary of Math.random() is exclusive.
    var total = 0;
    for (var i = 0; i < array.length; ++i) {
      total += parseInt(array[i].weight);
    }

    // Total in hand, we can now pick a random value akin to our
    // random index from before.
    const threshold = Math.random() * total;

    // Now we just need to loop through the main data one more time
    // until we discover which value would live within this
    // particular threshold. We need to keep a running count of
    // weights as we go, so let's just reuse the "total" variable
    // since it was already declared.
    total = 0;
    for (var i = 0; i < array.length; ++i) {
      // Add the weight to our running total.
      total += parseInt(array[i].weight);

      // If this value falls within the threshold, we're done!
      if (total >= threshold) {
        return array[i].value;
      }
    }
    return array[i].value;
  }
}

window.onload = function() {
  const canvas = document.getElementById("myCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", (event) => {
    hydra.setResolution(window.innerWidth, window.innerHeight)
  });
  // create a new hydra-synth instance
  let hydra = new Hydra({
    detectAudio: false,
    canvas: document.getElementById("myCanvas"),
  })
  WebMidi.enable(function(err) {
    if (err) throw err;
    WebMidi.getInputByName('IAC Driver Bus 1').addListener('noteon', 'all', function(e) {
      console.log(e.note.name)
      if (e.note.name === "A" && e.note.octave === 3) {
        randomShader(0);
      }
      if (e.note.name === "B" && e.note.octave === 3) {
        randomShader(1);
      }
      if (e.note.name === "C" && e.note.octave === 4) {
        randomShader(2);
      }
    });
  });
  randomShader(1)
}


const shaders = [
  shader1,
  shader2,
  shader3,
  shader4,
  shader5,
  shader6,
  shader7,
  shader8,
  shader9,
  shader10,
]

function shader1(brightness) {
  let speed = -0.5
  let size = 2 + 8 * Math.random()
  if (brightness > 1) {
    speed = -15 / size
  }
  osc(size, speed, 2 * Math.random())
    .color(-1.5 + Math.random(), -1.5 + Math.random(), -1.5 + Math.random())
    .blend(o0)
    .rotate(-0.5 + Math.random(), -0.5 + Math.random())
    .modulate(shape(4 * Math.random())
      .rotate(0.5 - Math.random(), 0.5 - Math.random())
      .scale(2 + Math.random())
      .repeatX(1 + 3 * Math.random(), 1 + 3 * Math.random())
      .modulate(o0, () => mouse.x * 0.0005)
      .repeatY(1 + 3 * Math.random(), 1 + 3 * Math.random()))
    .out(o0)
  render(o0)
}

function shader2(brightness) {
  let speed1 = 0.1
  let speed2 = 3
  let speed3 = 1
  if (brightness > 1) {
    speed1 = 1.5
    speed2 = 10
    speed3 = 5
  }
  let chain = voronoi(4 + 8 * Math.random(),speed3)
    .mult(osc(10 * Math.random() + 1,speed1,()=>Math.sin(time)*speed2).saturate(4 * Math.random()).kaleid(200 * Math.random()))
    .modulate(o0,Math.random())
    .add(o0,0.8 * Math.random())
    .scrollY(-0.02 + 0.04 * Math.random())
    .scrollX(-0.02 + 0.04 * Math.random())
    .scale(0.99)
    .modulate(voronoi(4 + 8 * Math.random(),1),0.004 + 0.008 * Math.random())
    .luma(0.3 * Math.random())
  chain.out(o0)

  render(o0)
}

function shader3(brightness) {
  let chain = osc(30 + 60 * Math.random(),-0.015 + 0.03 * Math.random(),Math.random() * 2).diff(osc(30 + 60 * Math.random(),0.08-0.16*Math.random()).rotate(Math.PI * Math.random()))
  .modulateScale(noise(3.5 + Math.random() * 5,0.25 - 0.5 * Math.random()).modulateScale(osc(15 * Math.random() + 15).rotate(()=>Math.sin(time * 0.5))),0.3 + Math.random() * 0.6)
  .color(Math.random(), Math.random(), Math.random()).contrast(1 + Math.random())
  .add(src(o0).modulate(o0,.04 + Math.random() * 0.04),.4 + Math.random() * 0.4)
  .invert().contrast(1.2)
  .modulateScale(osc(1 + 2 * Math.random()),-0.2)

  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o0)
  render(o0)
}

function shader4(brightness) {
  let speed1 = 0.2
  if (brightness > 1) {
    speed1 = 0.7
  }
  let chain = osc(5 + Math.random() * 35,speed1,Math.random() * 2)
  .modulateScale(osc(5 + Math.random() * 35,speed1,Math.random() * 2).kaleid(Math.random() * 16))
  .repeat(Math.random() * 3 + 1,Math.random() * 6 + 1)
  .modulate(o0,0.1 * Math.random())
  .modulateKaleid(shape(Math.round(8 * Math.random()),0.1 * Math.random(),1 * Math.random()))

  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o0)
  render(o0)
}

function shader5(brightness) {
  src(o0)
 .saturate(1.01)
 .scale(.999)
 .color(1.01,1.01,1.01)
 .hue(.01)
 .modulateHue(src(o1).hue(.3).posterize(-1).contrast(.7),2)
  .layer(src(o1)
         .luma()
         .mult(gradient(1)
               .saturate(.9)))
  .out(o0)

  let chain = noise(1, .2)
  .rotate(2,.5)
  .layer(src(o0)
  .scrollX(.2))
  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o1)
  render(o0)
}

function shader6(brightness) {
  shape(20,0.1,0.01)
  .scale(() => Math.sin(time)*3)
  .repeat(() => Math.sin(time)*10)
  .modulateRotate(o0)
  .scale(() => Math.sin(time)*2)
  .modulate(noise(2,0))
  .rotate(0.1, 0.9)
.out(o0)

src(o0)
.modulate(osc(500,0,0))
.out(o1)

  let chain = src(o1)
  .modulateKaleid(voronoi(() => Math.sin(time)*3,0.1,0.01),() => Math.sin(time)*3)
  .scale(() => Math.sin(time)*3)
  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o2)
  render(o2)
}

function shader7(brightness) {
  let chain = osc(5, 0.9, 0.001)
    .kaleid([3,4,5,7,8,9,10].fast(0.1))
    .color(0.5, 0.3)
    .colorama(0.4)
    .rotate(0.009,()=>Math.sin(time)* -0.001 )
    .modulateRotate(o0,()=>Math.sin(time) * 0.003)
    .modulate(o0, 0.9)
    .scale(0.9)

  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o0)
  render(o0)
}

function shader8(brightness) {
let chain = shape([4,5,6].fast(0.1).smooth(1),0.000001,[0.2,0.7].smooth(1))
.color(0.2,0.4,0.3)
.scrollX(()=>Math.sin(time*0.27))
.add(
  shape([4,5,6].fast(0.1).smooth(1),0.000001,[0.2,0.7,0.5,0.3].smooth(1))
  .color(0.6,0.2,0.5)
  .scrollY(0.35)
  .scrollX(()=>Math.sin(time*0.33)))
.add(
  shape([4,5,6].fast(0.1).smooth(1),0.000001,[0.2,0.7,0.3].smooth(1))
  .color(0.2,0.4,0.6)
  .scrollY(-0.35)
  .scrollX(()=>Math.sin(time*0.41)*-1))
.add(
      src(o0).shift(0.001,0.01,0.001)
      .scrollX([0.05,-0.05].fast(0.1).smooth(1))
      .scale([1.05,0.9].fast(0.3).smooth(1),[1.05,0.9,1].fast(0.29).smooth(1))
      ,0.85)
.modulate(voronoi(10,2,2))
if (brightness > 1) {
  chain = strobe(chain)
}
chain.out(o0)

render(o0)
}


function shader9(brightness) {
  let chain = osc(5 * Math.random() * 2, 1 * Math.random()).modulate(noise(6 * Math.random() * 2),.22 * Math.random() * 2).diff(o0)
    .modulateScrollY(osc(2 * Math.random() * 2).modulate(osc().rotate(),.11 * Math.random() * 2))
  .scale(.72 * Math.random() * 2).color(1 + Math.random() * 0.02,1 + Math.random() * 0.02,1 + Math.random() * 0.02).out()
  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o0)
  render(o0)
}

function shader10(brightness) {
  let speed1 = 8
  if (brightness > 1) {
    speed1 = 40
  }
  let chain = voronoi(150 + Math.random() * 200,3 * Math.random(), Math.random())
    .modulateScale(osc(speed1 * Math.random() * 2).rotate(Math.sin(time)))
    .thresh(.5 + 0.3 * Math.random())
  .modulateRotate(osc(Math.random() * 14),.4 * Math.random() * 2)
  .thresh(.5 + 0.3 * Math.random()).mult(osc(1,1,0.2 + Math.random() * 1.5))
    .diff(src(o0).scale(1.8 * Math.random() * 2))
  .modulateScale(osc(2 * Math.random() * 2).modulateRotate(o0,.74 * Math.random() * 2))
  .diff(src(o0).rotate([-.012 * Math.random() * 2,.01 * Math.random() * 2,-.002 * Math.random() * 2,0]).scrollY(0,[-1/199800 * Math.random() * 2,0].fast(0.7 * Math.random() * 2)))
  .brightness([-.02 * Math.random() * 2,-.17 * Math.random() * 2].smooth().fast(.5 * Math.random * 2))
  if (brightness > 1) {
    chain = strobe(chain)
  }
  chain.out(o0)
  render(o0)
}

function strobe(chain) {
  return chain.brightness( ({time}) => Math.sin(time * 1000) * 0.2 )
}

let lastBrightness = 0
function randomShader(brightness) {
  solid(1,1,1).out()
  lastBrightness = brightness
//  let choice = randomChoice(shaders)
  let choice = shader1
  setTimeout(function() {
    if (brightness === 0) {
      solid(0,0,0).out()
    } else {
      choice(brightness)
    }
  }, 100)
}
