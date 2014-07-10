'use strict'

var Swarm = function(population, originX, originY, width, height){
  this.population = population || [];
  this.quadtree   = new Quadtree(new Box(
                                        new Point(originX, originY),
                                        new Point(originX+width, originY+height)
                                        ));
};

Swarm.prototype.tick = function(){
  //insert all agents into quadtree
  for ( var i = 0; i < this.population.length; i++ ){
    this.quadtree.insert(new Point(this.population[i].position.left, this.population[i].position.top), this.population[i]);
  }
  //calcualate next acceleration of each agent
  var that = this; 
  for ( i = 0; i < this.population.length; i++ ){
    //callback takes in area of effect, position vector and list of affecting agents
    this.population[i].calculateNextAcceleration(function(aoe, position, agents){
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

