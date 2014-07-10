'use strict'

// var quadtree = require('quadtree');

var Swarm = function(population, originX, originY, width, height){
  this.population = population || [];
  this.quadtree   = new Quadtree(new Box(
                                        new Point(originX, originY),
                                        new Point(originX+width, originY+height)
                                        ));
};

Swarm.prototype.tick = function(){

  for ( var i = 0; i < this.population.length; i++ ){
    this.quadtree.insert(new Point(this.population[i].position.left, this.population[i].position.top), this.population[i]);
  }

  var that = this; 
  for ( i = 0; i < this.population.length; i++ ){
    //callback takes in area of effect, position vector and list of affecting agents 
    this.population[i].calculateNextAcceleration(function(aoe, position, agents){
      //add tests to quadtree to ensure negative values handled correctly
      var neighbors = that.quadtree.queryRange(new Box(
                new Point(position.left-aoe, position.top-aoe),
                new Point(position.left+aoe, position.top+aoe)));
      var temp = [];
      for (var j = 0; j < neighbors.length; j++ ){
        if(agents.indexOf(neighbors[j].value.type) !== -1){
          temp.push(neighbors[j].value);
        }
      }

      return temp;
    });
  }
  //update acceleration velocity and position for each agent
  for( i = 0; i < this.population.length; i++ ){
    this.population[i].update();
  }
  //clear quadtree
  this.quadtree.clear();
};

Swarm.prototype.getPopulation = function(){
  return this.population;
};

var Agent = function(opts){
  this.type               = opts.type               || 'default';
  this.forces             = opts.forces             || {};
  this.position           = opts.position           || new Vector(0,0);
  this.velocity           = opts.velocity           || new Vector(0,0);
  this.acceleration       = opts.acceleration       || new Vector(0,0);
  this.velocityLimit      = opts.velocityLimit      || 2;
  this.accelerationLimit  = opts.accelerationLimit  || .3;
  this.nextAcceleration   = new Vector(0, 0);

};

Agent.prototype.update = function(){
  this.updatePosition();
  this.updateVelocity();
  this.updateAcceleration();
};

Agent.prototype.updateVelocity = function(){
  this.velocity = this.velocity.add(this.acceleration);
  if(this.velocity.magnitude() > this.velocityLimit){
    this.velocity = this.velocity.unitVector(this.velocityLimit);
  }
};

Agent.prototype.updatePosition = function(){
  this.position = this.position.add(this.velocity);
};

Agent.prototype.updateAcceleration = function(){
  this.acceleration = this.nextAcceleration;
  if(this.acceleration.magnitude() > this.accelerationLimit){
    this.acceleration = this.acceleration.unitVector(this.accelerationLimit);
  }
};
/*
try to make implementation of calculateAcceleration
agnostic to 'find neighbor' function while simultaneously not
having to pass out array of forces

callback takes in area of effect, position vector and list of affecting agents
returns neighbors in affected area
*/

Agent.prototype.calculateNextAcceleration = function(callback, bounds){
  var resultantVector = new Vector(0, 0);

  /* later allow for arbitrary or random forces that don't eminate from another agent*/
  var that = this;
  var neighbors;
  for ( var i = 0; i < this.forces.length; i++ ){
    if(this.forces[i].areaOfEffect){
      neighbors = callback(this.forces[i].areaOfEffect, this.position, this.forces[i].causes);    //get set of neighbors within AoE and of causing type
    }
    resultantVector = resultantVector.add(this.forces[i].calculate(that, neighbors).multiplyScalar(this.forces[i].strength)); //calculate vector and add to resultant vector
  }
  this.nextAcceleration = this.acceleration.add(resultantVector);
  //if bounding function passed in then add to next acceleration
  // if (bounds){
  //   this.nextAcceleration = this.nextAcceleration.add(bounds(this));
  // }
  if (this.nextAcceleration.magnitude() > this.accelerationLimit){
    this.nextAcceleration.unitVector(this.accelerationLimit);
  }

};

//agent factory factory object
var AgentFactory = function(opts){

};

AgentFactory.prototype.create = function(num){

};



var Vector = function(left, top){
  this.top  = top  || 0;
  this.left = left || 0;
};

Vector.prototype.add = function(v2){
  var t = this.top;
  var l = this.left;
  for (var i = 0; i < arguments.length; i++){
    t += arguments[i].top;
    l += arguments[i].left;
  }
  return new Vector(l, t);
};

Vector.prototype.distance = function(v2){
  return Math.sqrt(Math.pow((this.left-v2.left), 2) + Math.pow((this.top-v2.top), 2));
};

Vector.prototype.multiplyScalar = function(val){
  this.top  *= val;
  this.left *= val;
  return this;
};

Vector.prototype.magnitude = function(){
  return this.distance(this.origin);
};

Vector.prototype.unitVector = function(limit){
  limit = limit || 1;
  var m = this.magnitude() || 1;
  return new Vector(this.left*limit/m, this.top*limit/m);
};

Vector.prototype.origin = new Vector(0, 0);

