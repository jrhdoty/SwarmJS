'use strict'

// var quadtree = require('quadtree');

var Swarm = opts.function(population, originX, originY, width, height){
  this.population = population || [];
  this.quadtree = new quadtree(new Box(
                                        new Point(originX, originY),
                                        new Point(originX+width, originY+height)
                                        ));
};

Swarm.prototype.tick = function(){

  for ( var i = 0; i < this.population.length; i++ ){
    this.quadtree.insert(this.population[i].position, this.population[i]);
  }

  //calculate new acceleration for each agent
  for ( i = 0; i < this.population.length; i++ ){
    //callback takes in area of effect, position vector and list of affecting agents  
    this.population[i].calculateNextAcceleration(function(aoe, position, agents){
      //add tests to quadtree to ensure negative values handled correctly
      var neighbors = this.quadtree.queryRange(new Box(
                new Point(position.left-aoe, position.top-aoe),
                new Point(position.left+aoe, position.top+aoe)));
      var temp;
      for (var j = 0; j < neighbors.length; j++ ){
        if(agents.indexOfneighbors !== -1){
          temp.push(neighbors[j]);
        }
      }
      return temp;
    });
  }
  //update acceleration velocity and position for each agent
  for( i = 0; i < this.population.length; i++ ){
    this.population[i].update();
  }
};


var Agent = function(opts){
  this.type               = opts.type               || 'default';
  this.forces             = opts.forces             || {};
  this.position           = opts.position           || new Vector(0,0);
  this.velocity           = opts.velocity           || new Vector(0,0);
  this.acceleration       = opts.acceleration       || new Vector(0,0);
  this.velocityLimit      = opts.velocityLimit      || 10;
  this.accelerationLimit  = opts.accelerationLimit  || 10;
  this.momentum           = opts.momentum           || 10;
  this.nextAcceleration   = new Vector(0, 0);

};

Agent.prototype.update = function(){
  this.updatePosition();
  this.updateVelocity();
  this.updateAcceleration();
};

Agent.prototype.updateVelocity(){
  this.velocity = this.velocity.add(this.acceleration);
};

Agent.prototype.updatePosition(){
  this.position = this.position.add(this.velocity);
};

Agent.prototype.updateAcceleration(){
  this.acceleration = this.nextAcceleration;
}
/*
try to make implementation of calculateAcceleration
agnostic to 'find neighbor' function while simultaneously not
having to pass out array of forces

callback takes in area of effect, position vector and list of affecting agents
returns neighbors in affected area
*/

Agent.prototype.calculateNextAcceleration = function(callback){
  var resultantVector = new Vector(0, 0);

  /* later allow for arbitrary or random forces that don't eminate from another agent*/
  for ( var i = 0; i < this.forces.length; i++ ){
    var neighbors = callback(this.forces[i].areaOfEffect, this.position, this.forces[i].causes);    //get set of neighbors within AoE and of causing type
    resultantVector.add(this.forces[i].strength*this.forces[i].calculate(neighbors)); //calculate vector and add to resultant vector
  }

  this.nextAcceleration = this.acceleration.add(resultantVector);

  if (this.nextAcceleration.magnitude() > this.accelerationLimit){
    this.nextAcceleration.unitVector(this.accelerationLimit);
  }

  //add boundary avoidance force
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

