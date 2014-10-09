(function(){
  'use strict';
  var centerOfMass = function(agent, neighbors){
    var result = new Vector(0, 0);
    if(neighbors.length === 0){ return result; }

    for (var i = 0; i < neighbors.length; i++) {
      result = result.add(neighbors[i].position);
    }
    result.multiplyScalar(1/neighbors.length);  //average
    result = result.sub(agent.position);  //difference b/w current pos and CoM
    return result;
  };

  var matchHeading = function(agent, neighbors){
    var result = new Vector(0, 0);
    if(neighbors.length === 0 || neighbors === undefined){ return result; }

    for (var i = 0; i < neighbors.length; i++) {
      result = result.add(neighbors[i].velocity);
    }
    result.multiplyScalar(1/neighbors.length);  //avg neighbor heading
    return result;
  };

  var separation = function(agent, neighbors){
    var result = new Vector(0, 0);
    if(neighbors.length === 0 || neighbors === undefined){ return result; }
    
    for (var i = 0; i < neighbors.length; i++) {
      result = result.add(agent.position.sub(neighbors[i].position)); //determine the repulsion vector and add to final result
    }
    result.multiplyScalar(1/neighbors.length);
    return result;
  };

  var momentum = function(agent){
    return agent.velocity;
  };

  var boundaryAvoidance = function(agent){
    var bounds =  [20, 20, window.innerHeight, window.innerWidth];
    var result = new Vector(0, 0);
    if (agent.position.top < bounds[0]) {
      result.top = bounds[0]-agent.position.top;
    } else if (agent.position.top > bounds[2]) {
      result.top = bounds[2]-agent.position.top;
    }
    if (agent.position.left < bounds[1]) {
      result.left = bounds[1]-agent.position.left;
    } else if (agent.position.left > bounds[3]) {
      result.left = bounds[3]-agent.position.left;
    }
    return result;
  };

  var opts = {
    type:     'boid',
    forces: 
      [
        { causes: ['boid'],
          areaOfEffect: 25,
          strength: 1,
          calculate: centerOfMass}, 
        { causes: ['boid'],
          areaOfEffect: 25,
          strength: 15,
          calculate:matchHeading},
        { causes: ['boid'],
          areaOfEffect: 8,
          strength: 30,
          calculate: separation}, 
        { causes: [],
          areaOfEffect: 0,
          strength: 0.99,
          calculate: momentum}, 
        { causes: [],
          areaOfEffect: 0,
          strength: 50,
          calculate: boundaryAvoidance}
      ],
    position: new Vector(100, 100),
    velocity:  new Vector(1, 1),
  };

  var population = [];
  var size = 1000;
  while(size--){
    opts.position = new Vector(Math.random()*window.innerWidth, Math.random()*window.innerHeight);
    opts.velocity = new Vector((Math.random()-.5)*1, (Math.random()-.5)*1);
    population.push(new Agent(opts));
  }
  window.swarm = new Swarm(population, 0, 0, window.innerWidth, window.innerHeight);
}());
  
var canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;
var context = canvas.getContext('2d');

function animate() {
  context.fillStyle = 'rgba(20,20,20,0.15)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  window.swarm.forEach(function(boid){
    var centerX = boid.position.left;
    var centerY = boid.position.top;
    context.beginPath();
    context.fillStyle = '#00CC00';
    context.fillRect(centerX, centerY, 2, 2);
  });
  window.swarm.tick();
  window.requestAnimationFrame(animate);
}
animate();
