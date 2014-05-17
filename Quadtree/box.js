var Point = function(x, y){
  this.x = x;
  this.y = y;
};

var Box = function(vertex, width, height){
  this.vertex = vertex;
  this.width = width;
  this.height = height;
};


Box.prototype.containsPoint = function(point){
  if(this.vertex.x <= point.x && this.vertex.x+this.width >= point.x && 
    this.vertex.y <= point.y && this.vertex.y+this.height >= point.y ){
    return true;
  }
  return false;
};

Box.prototype.overlaps = function(box){
  if(this.vertex.x > box.vertex.x+box.width   || this.vertex.y > box.vertex.y+box.height ||
     box.vertex.x  > this.vertex.x+this.width || box.vertex.y  > this.vertex.y+this.height){
      return false;
  }
  return true;
};

//start in top left and move clockwise, 0-3
Box.prototype.getQuadrant = function(quad){
  var w = this.width/2.0;
  var h = this.height/2.0;

  if(quad === 0){
    return new Box(new Point(this.vertex.x, this.vertex.y), w, h);
  } else if(quad === 1) {
    return new Box(new Point(this.vertex.x+w, this.vertex.y), w, h);
  } else if(quad === 2){
    return new Box(new Point(this.vertex.x+w, this.vertex.y+h), w, h);
  } else if(quad ===3){
    return new Box(new Point(this.vertex.x, this.vertex.y+h), w, h);    
  }

  return;
};
