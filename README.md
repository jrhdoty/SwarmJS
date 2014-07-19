SwarmJS
=======

##Description

SwarmJS is a simple agent based modeling framework for creating 2D simulations of multi-agent systems that run in the browser.  It allows for the definition of multiple agent types and arbitrary forces that represent the interactions between them.  A quadtree is used for quick lookups of agents in the area of effect of a particular force.

##Example

An implementation of Craig Reynolds' Boids flocking simulation using this framework can be seen [here.](http://jrhdoty.github.io/SwarmJS/)  This example renders 1000 boids to html5 canvas at 60 fps.  The code for this example can be found in /examples/boids/boids.js

##Use

``` javascript
var Swarm     = require('../../index').Swarm;
var Agent     = require('../../index').Agent;
var Vector    = require('../../lib/vector');
var raf       = require('raf');

//define force functions
var centerOfMass    = function(agent, neighbors){...};
var matchHeading    = function(agent, neighbors){...};
var separation      = function(agent, neighbors){...};
var avoidBoundaries = function(){...};

/*
define agent type, initial position and initial velocity
for each force, define the following:
  area of effect, 
  relative strength,
  agent that causes the force (most of the forces below are reflexive)
  force function
*/
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
};

//instantiate agents with options defined above with random initial position and velocity
var population = [];
var size = 1000;
while(size--){
  opts.position = new Vector(Math.random()*window.innerWidth, Math.random()*window.innerHeight);
  opts.velocity = new Vector((Math.random()-.5)*1, (Math.random()-.5)*1);
  population.push(new Agent(opts));
}

//instantiate new simulation with population and bounds
window.swarm = new Swarm(population, 0, 0, window.innerWidth, window.innerHeight);

//increment the simulation, iterate over each agent and render on each tick
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
  raf(animate);
}
raf(animate());
