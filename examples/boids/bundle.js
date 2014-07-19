(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Swarm     = require('../../index').Swarm;
var Agent     = require('../../index').Agent;
var Vector    = require('../../lib/vector');
var raf       = require('raf');

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
    //match heading with neighbors
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
    var radius = 10;
    context.beginPath();
    context.fillStyle = '#00CC00';
    context.fillRect(centerX, centerY, 2, 2);
  });
  window.swarm.tick();
  raf(animate);
}

raf(animate());

},{"../../index":2,"../../lib/vector":3,"raf":5}],2:[function(require,module,exports){
'use strict'
var Vector    = require('./lib/vector');
var QT        = require('generic-quadtree');
var Quadtree  = QT.Quadtree;
var Box       = QT.Box;
var Point     = QT.Point;

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

Agent.prototype.calculateNextAcceleration = function(callback, bounds){
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

module.exports.Agent = Agent;
module.exports.Swarm = Swarm;

},{"./lib/vector":3,"generic-quadtree":4}],3:[function(require,module,exports){
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

module.exports = Vector;
},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for (var i = 0; i < cp.length; i++) {
          if (!cp[i].cancelled) {
            cp[i].callback(last)
          }
        }
      }, next)
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function() {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.apply(global, arguments)
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":6}],6:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,require("0NpzKc"))
},{"0NpzKc":7}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])