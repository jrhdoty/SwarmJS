
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
    if(boid.type === 'bird'){
      context.fillStyle = '#00CC00';
    } else if ( boid.type === 'raptor' ){
      context.fillStyle = 'red';
    }

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
