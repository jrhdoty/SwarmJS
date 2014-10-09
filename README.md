SwarmJS
=======

###Description

SwarmJS is a simple agent based modeling framework for creating 2D simulations of multi-agent systems that run in the browser.  It allows for the definition of multiple agent types and arbitrary forces that represent the interactions between them.  A quadtree is used for quick lookups of agents in the area of effect of a particular force.

###Example

An implementation of Craig Reynolds' Boids flocking simulation using this framework can be seen [here.](http://jrhdoty.github.io/SwarmJS/)  This example renders 1000 boids to html5 canvas at 60 fps.  The code for this example can be found in /examples/boids/boids.js

###Installation
```bower install swarm --save```

###Use

``` javascript
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

//instantiate agents with options and random initial position and velocity
var population = [];
var size = 1000;
while(size--){
  opts.position = new Vector(Math.random()*window.innerWidth, Math.random()*window.innerHeight);
  opts.velocity = new Vector((Math.random()-.5)*1, (Math.random()-.5)*1);
  population.push(new Agent(opts));
}

//instantiate new simulation with population and bounds
window.swarm = new Swarm(population, 0, 0, window.innerWidth, window.innerHeight);

//visualize your simulation 
function animate() {
  //make it pretty here
  window.swarm.tick();
  window.requestAnimationFrame(animate);
}

animate();
```

**new Agent({options})**

The list of all possible options are:
- type
- forces
- position
- velocity
- acceleration
- velocityLimit
- accelerationLimit

**Force**

A force that is passed as an option to Agent contains the following
- a list of agent types that cause the force
- area of effect
- relative strength
- function that is passed the agent and all neighboring agents that are within the area of the effect and are of the same type as one of the causing agents

Forces can use agents' position, velocity or acceleration vectors to determine what the returned resulting force will be for a particular force.

**new Swarm(agents, originX, originY, width, height)**

Instantiate a new swarm with an array of Agents and the bounds of the simulation

**Swarm.tick()**

Update the simulation by calculating the new acceleration, velocity and position of each agent in the population.

**Swarm.forEach(callback)**

Iterate over each agent in Swarm and pass it to the callback 

###Contributing
Pull requests are welcome.  Some desired areas are:
- optimization
- examples

###Inspiration
This library seeks to be a more general version of [Hughsk's Boids](https://github.com/hughsk/boids)
