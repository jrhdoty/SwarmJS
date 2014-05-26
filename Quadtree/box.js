'use strict';

var Point = function(x, y){
  this.x = x;
  this.y = y;
};

//strict less than
Point.prototype.lt = function(point){
  if(this.x < point.x && this.y < point.y){
    return true;
  }
  return false;
};

//strict greater than
Point.prototype.gt = function(point){
  if (this.x > point.x && this.y > point.y){
    return true;
  }
  return false;
};

//generalized box class, defined by two points with lessThan (lt) and greaterThan (gt) functions
//these functions are strict across two dimensions
var Box = function(least, greatest){
  this.low = least;
  this.high = greatest;
};


Box.prototype.containsPoint = function(point){
  //if point is not strictly less than least and not strictly greater than greatest, it is contained
  if(this.low.lt(point) && this.high.gt(point)){
    return true;
  }
  return false;
};

Box.prototype.overlaps = function(box){
  //if this contains either point of box, then there is an overlap
  if(this.containsPoint(box.low) || this.containsPoint(box.high)){
      return true;
  }
  return false;
};

//this still needs to be generalized so not just utilizing division
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









