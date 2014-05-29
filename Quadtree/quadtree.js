'use strict';

var Quadtree = function(box, max){
  this.box = box;
  this.children = null;
  this.value = null;
  this.max = max;
};

Quadtree.prototype.insert = function(point, object){
  //check if should contain x, y
  //need to check if point already exists
  if (!this.box.containsPoint(point)){
    return this;
  }
  //if is a root node and not full, then insert
  if (this.children === null && this.value === null){
    this.value = [{point: point, value:object}];
    return this;
  }
  //if is a root node but full, call subdivide and then insert on the child nodes
  if(this.children === null){
    //check to see if point is equal
    if(this.value[0].point.x === point.x && this.value[0].point.y === point.y){
      this.value[0].value = object;
    } else {
      this.subdivide();
    }
  }
  // if is not a root node, call insert on child nodes
  for(var i = 0; i < this.children.length; i++){
    this.children[i].insert(point, object);
  }
  this.value = null;
  return this;
};

Quadtree.prototype.subdivide = function(){
  //use box quadrant method to create 4 new equal child quadrants
  this.children = this.box.split();
  for(var i = 0; i < this.children.length; i++){
    this.children[i] = new Quadtree(this.children[i]);
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
  //if query area doesn't overlap this box, return
  if (!this.box.overlaps(box)){
    return [];
  }
  //if root node with contained value(s), then check against contained objects
  var intersection = [];
  if(this.value !== null){
    for(var i = 0; i < this.value.length; i++){
      if(box.containsPoint(this.value[i].point)){
        intersection.push(this.value[i]);
      }
    }
    return intersection;
  }

  //if has children, then make recursive call on children 
  if(this.children !== null){
    for(var i = 0; i < this.children.length; i++){
      intersection = intersection.concat(this.children[i].queryRange(box));
    }
    return intersection;
  }

  //if root node without value then return
  return [];
};

Quadtree.prototype.queryPoint = function(point){
  //return value if tree contains point
  if(!this.box.containsPoint(point)){
    return null;
  }

  if (this.value !== null){
    if (this.value[0].point.x === point.x && this.value[0].point.y === point.y){
      return this.value[0].value;
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

Quadtree.prototype.clear = function(){
  this.children = null;
  this.value = null;
};







