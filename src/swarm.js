'use strict';
var Swarm = function(population, originX, originY, width, height){
  this.population = population || [];
  this.quadtree   = new Quadtree(new Box(
                                        new Point(originX, originY),
                                        new Point(originX+width, originY+height)
                                        ));
};

Swarm.prototype.tick = function(){
  //insert agents into quadtree
  var i, point, agent;
  for ( i = 0; i < this.population.length; i++ ){
    agent = this.population[i];
    point = new Point(agent.position.left, agent.position.top);
    this.quadtree.insert(point, agent);
  }

  //calculate the forces on and resulting acceleration of each agent
  var that = this;
  for ( i = 0; i < this.population.length; i++ ){
    //the callback function here returns the set of agents that will cause an effect
    //it is abstracted as a callback so we're not hardwired into using a quadtree
    //for neighbor range lookup
    this.population[i].calculateNextAcceleration(function recAcc(aoe, position, agents){
      //get all agents with AoE
      var aoeRange = new Box(
                     new Point(position.left-aoe, position.top-aoe),
                     new Point(position.left+aoe, position.top+aoe));
      var neighbors = that.quadtree.queryRange(aoeRange);

      //if agent is of the causing agent type
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
  //after we've calculated what the current forces being applied 
  //to the agent are
  for( i = 0; i < this.population.length; i++ ){
    this.population[i].update();
  }
  //reset our quadtree
  this.quadtree.clear();
};

Swarm.prototype.forEach = function(callback){
  for (var i = 0; i < this.population.length; i++){
    callback(this.population[i]);
  }
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

Agent.prototype.calculateNextAcceleration = function(callback){
  var resultantVector = new Vector(0, 0);
  var that = this;
  var neighbors;
  for ( var i = 0; i < this.forces.length; i++ ){
    if(this.forces[i].areaOfEffect){
      neighbors = callback(this.forces[i].areaOfEffect, this.position, this.forces[i].causes);    //get set of neighbors within AoE and of causing type
    }
    resultantVector = resultantVector.add(this.forces[i].calculate(that, neighbors).multiplyScalar(this.forces[i].strength)); //calculate vector and add to resultant vector
  }
  this.nextAcceleration = this.acceleration.add(resultantVector);

  if (this.nextAcceleration.magnitude() > this.accelerationLimit){
    this.nextAcceleration.unitVector(this.accelerationLimit);
  }
};
