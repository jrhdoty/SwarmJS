var force = {
  causes: ['bird'],
  areaOfEffect: 50,
  strength: 5,
  calculate: function(neighbors){
    //head toward neighbors center of mass
    var center = new Vector(0, 0);
    if(neighbors.length === 0){
      return center;
    }

    for (var i = 0; i < neighbors.length; i++) {
      center = center.add(neighbors[i].position);
    }

    center.top /= neighbors.length;     //find the center of mass
    center.top -=this.position.top;   //find the difference b/w current position and CoM
    center.left /= neighbors.length;      //same as above
    center.left -= this.position.left;
    return center;
  }
};

var opts = {
  type:     'bird',
  forces:   [force],
  position: new Vector(100, 100),
  velocity:  new Vector(1, 1),
};


var population = [];
population.push(new Agent(opts));
for( var i = 0; i < 1000; i++ ){
  opts.position = new Vector(Math.random()*50, Math.random()*50);
  opts.velocity = new Vector(Math.random()*1, Math.random()*1);
  population.push(new Agent(opts));
}

window.swarm = new Swarm(population, 0, 0, window.innerWidth, window.innerHeight);

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

var canvas = document.getElementById('myCanvas');
//get dimensions
//setting dimensions inside animate automatically clears screen
//see this stackoverflow
//http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;
var context = canvas.getContext('2d');

function animate() {
  var i = 0;
  //get canvas
  //get context

  //instead of clearing, let's try fading
  // context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(20,20,20,0.15)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  var boids = window.swarm.getPopulation();

  //draw boids
  for(i = 0; i < boids.length; i++){
    boid = boids[i];

    var centerX = boid.position.left;
    var centerY = boid.position.top;
    var radius = 10;
    // context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

    context.beginPath();
    // context.fillStyle = 'hsl('+ boid.acceleration.magnitude()*240 + ',100%,50%)';
    context.fillStyle = '#00CC00';
    context.fillRect(centerX, centerY, 2, 2);
  }

  //update accelation of agents
  window.swarm.tick();

  // request new frame
  requestAnimFrame(function() {
    animate();
  });
}

animate();
