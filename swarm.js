'use strict';

var Quadtree = function(box, max){
  this.box = box;
  this.children = null;
  this.value = [];
  this.max = max || 10; //max points per node
};

Quadtree.prototype.insert = function(point, object){
  //check if should contain point
  if (!this.box.contains(point)){
    return this;
  }

  //if is a leaf node and not full, then insert
  //need to check if it already exists though
  var i;
  if (this.children === null && this.value.length < this.max){
    for( i = 0; i < this.value.length; i++ ){
      if(this.value[i].point.equals(point)){
        this.value[i].value = object;
        return;
      }
    }
    this.value.push({point: point, value:object});
    return this;
  }

  //if is a leaf node but full, call subdivide
  if(this.children === null){
      this.subdivide();
  }

  // if is not a leaf node, call insert on child nodes
  for( i = 0; i < this.children.length; i++ ){
    this.children[i].insert(point, object);
  }
  this.value = [];
  return this;
};

Quadtree.prototype.subdivide = function(){
  //use box quadrant method to create 4 new equal child quadrants
  this.children = this.box.split();
  for(var i = 0; i < this.children.length; i++){
    this.children[i] = new Quadtree(this.children[i], this.max);
  }
  //try inserting each value into the new child nodes
  for(i = 0; i < this.value.length; i++){
    for(var k = 0; k < this.children.length; k++){
      this.children[k].insert(this.value[i].point, this.value[i].value);
    }
  }
};

Quadtree.prototype.queryRange = function(box){
  //return all point/value pairs contained in range
  var result = [];
  this._queryRangeRec(box, result);
  return result;
};

Quadtree.prototype._queryRangeRec = function(box, result){
  //if query area doesn't overlap this box then return
  if (!this.box.overlaps(box)){
    return;
  }
  //if leaf node with contained value(s), then check against contained objects
  var i;
  if(this.value.length > 0){
    for( i = 0; i < this.value.length; i++ ){
      if(box.contains(this.value[i].point)){
        result.push(this.value[i]);
      }
    }
    return;
  }
  //if has children, then make recursive call on children 
  if(this.children !== null){
    for( i = 0; i < this.children.length; i++ ){
      this.children[i]._queryRangeRec(box, result);
    }
    return;
  }
};

Quadtree.prototype.queryPoint = function(point){
  //return value if tree contains point
  if(!this.box.contains(point)){
    return null;
  }

  if (this.value.length > 0){
    for (var i = 0; i < this.value.length; i++){
      if (this.value[i].point.equals(point)){
       return this.value[i].value;
      }
    }
  }

  if (this.children !== null){
    var val = null;
    for(var i = 0; i < this.children.length; i++){
      val = val || this.children[i].queryPoint(point);
    }
    return val;
  }
  return null;
};

Quadtree.prototype.removePoint = function(point){
  //return if tree doesn't contain point
  if(!this.box.contains(point)){
    return;
  }

  var i;
  if (this.value.length > 0){
    for ( i = 0; i < this.value.length; i++ ){
      if (this.value[i].point.equals(point)){
        this.value.splice(i,1);
        return;
      }
    }
    return; // didn't contain point and is leaf node
  }

  if (this.children !== null){
    for( i = 0; i < this.children.length; i++ ){
      this.children[i].removePoint(point);
    }
  }
  return;
};

Quadtree.prototype.clear = function(){
  this.children = null;
  this.value = [];
};


//generalized box class, defined by two points with lessThan (lte) and greaterThan (gte) functions
var Box = function(least, greatest){
  this.low = least;
  this.high = greatest;
};

//return true if box contains point
Box.prototype.contains = function(point){
  if(this.low.lte(point) && this.high.gte(point)){
    return true;
  }
  return false;
};

//return true if overlap of boxes
Box.prototype.overlaps = function(box){
  //if this contains either point of box, then there is an overlap
  if(this.contains(box.low) || this.contains(box.high) || 
     box.contains(this.low) || box.contains(this.high)){
      return true;
  }
  return false;
};

//return array of children
Box.prototype.split = function(){
  var result = [];
  result.push(new Box(this.low, new Point((this.low.x+this.high.x)/2, (this.low.y+this.high.y)/2)));
  result.push(new Box(new Point((this.low.x+this.high.x)/2, this.low.y), 
              new Point(this.high.x, (this.low.y+this.high.y)/2)));
  result.push(new Box(new Point((this.low.x+this.high.x)/2, (this.low.y+this.high.y)/2), this.high));
  result.push(new Box(new Point(this.low.x, (this.low.y+this.high.y)/2), 
              new Point((this.low.x+this.high.x)/2, this.high.y)));
  return result;
};

//two dimensional point
var Point = function(x, y){
  this.x = x;
  this.y = y;
};

//less than or equal to in both dimensions
Point.prototype.lte = function(point){
  if(this.x <= point.x && this.y <= point.y){
    return true;
  }
  return false;
};

//greater than or equal to in both dimensions
Point.prototype.gte = function(point){
  if (this.x >= point.x && this.y >= point.y){
    return true;
  }
  return false;
};

//return true if points are equal in both dimensions
Point.prototype.equals = function(point){
  return (this.x === point.x  && this.y === point.y);
};

//make compatible with use in browser
if (typeof module !== 'undefined') {
  module.exports.Quadtree = Quadtree;
  module.exports.Box = Box;
  module.exports.Point = Point;
}

'use strict';
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

Vector.prototype.sub = function(v2){
  var t = this.top;
  var l = this.left;
  for (var i = 0; i < arguments.length; i++){
    t -= arguments[i].top;
    l -= arguments[i].left;
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

// module.exports = Vector;
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
