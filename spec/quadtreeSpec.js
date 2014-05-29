/* global quadtree, describe, it, expect, should */

describe('Quadtree', function () {
  'use strict';
  var quad, box, point, point1;
  beforeEach(function(){
    point = new Point(0, 0);
    point1 = new Point(100, 100);
    box   = new Box(point, point1);
    quad  = new Quadtree(box);
  });

  it('exists', function () {
    expect(Quadtree).to.be.a('function');

  });

  it('has functions insert, subdivide, clear, queryRange, and queryPoint', function () {
    expect(quad.insert).to.be.a('function');
    expect(quad.subdivide).to.be.a('function');
    expect(quad.clear).to.be.a('function');
    expect(quad.queryRange).to.be.a('function');
    expect(quad.queryPoint).to.be.a('function');
  });

  it('function insert should correctly insert into an empty root element', function () {
    var point = new Point(10, 15);
    quad.insert(point);
    expect(quad.value[0].point).to.equal(point);
  });

  it('should correctly insert and contain many elements', function(){
    var points = [];
    var x, y, p;

    for(var i = 0; i < 1000; i++){
      x = Math.random()*100;
      y = Math.random()*100;
      p = new Point(x, y);
      points.push(p);
      quad.insert(p, true);
    }

    var contains = true;
    for( i = 0; i < points.length; i++){
      if(!quad.queryPoint(points[i])){
        contains = false;
      }
    }
    expect(contains).to.equal(true);
  });

  it('subdivide should correctly generate four child nodes', function(){
    var point = new Point(10, 15);
    quad.insert(point);
    quad.subdivide();
    expect(quad.children.length).to.equal(4);
  });

  it('subdivide should correctly subdivide and then insert value to the correct child nodes', function(){
    var point1 = new Point(10, 15);
    var point2 = new Point(75, 75);
    quad.insert(point1);
    quad.insert(point2);
    expect(quad.children.length).to.equal(4);
    expect(quad.children[0].value.length).to.equal(1);
    expect(quad.children[2].value.length).to.equal(1);
  });


  it('queryRange should return all points contained in the input box in the tree', function(){
    var p  = new Point(11, 14.2);   //should be in quad 0
    var p1 = new Point(62.4, 18.2); //should be in quad 1
    var p2 = new Point(75, 75);     //should be in quad 2
    var p3 = new Point(10, 83.2);   //should be in quad 3
    quad.insert(p).insert(p1).insert(p2).insert(p3);

    p = new Point(5, 5);
    p1 = new Point(15, 15);
    var box = new Box(p, p1);

    var result = quad.queryRange(box);
    expect(result.length).to.equal(1);
    expect(result[0].point.x).to.equal(11);
    expect(result[0].point.y).to.equal(14.2);
    expect(result[0].value).to.equal(undefined);

    p = new Point(5, 5);
    p1 = new Point(68, 25);
    box = new Box(p, p1);

    result = quad.queryRange(box);
    expect(result.length).to.equal(2);

    p = new Point(0, 0);
    p1 = new Point(100, 100);
    box = new Box(p, p1);
    result = quad.queryRange(box);
    expect(result.length).to.equal(4);    
  });

  // Add more assertions here
});
