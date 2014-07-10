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