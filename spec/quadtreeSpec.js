/* global quadtree, describe, it, expect, should */

describe('Quadtree', function () {
  'use strict';
  var quad, box, point;
  beforeEach(function(){
    point = new Point(0, 0);
    box   = new Box(point, 100, 100);
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

  it('subdivide should create child nodes with the correct areas', function(){
    var p = new Point(11, 14.2);
    var b = new Box(p, 18.6, 18.2);
    quad = new Quadtree(b);

    var point1 = new Point(16.2, 15.8);
    var point2 = new Point(20, 20);
    quad.insert(point1);
    quad.insert(point2);
    expect(quad.children.length).to.equal(4);

    expect(quad.children[0].box.vertex.x).to.equal(quad.box.vertex.x);
    expect(quad.children[0].box.vertex.y).to.equal(quad.box.vertex.y);
    expect(quad.children[0].box.width).to.equal(quad.box.width/2.0);
    expect(quad.children[0].box.height).to.equal(quad.box.height/2.0);

    expect(quad.children[1].box.vertex.x).to.equal(quad.box.vertex.x+ quad.box.width/2.0);
    expect(quad.children[1].box.vertex.y).to.equal(quad.box.vertex.y);
    expect(quad.children[1].box.width).to.equal(quad.box.width/2.0);
    expect(quad.children[1].box.height).to.equal(quad.box.height/2.0);

    expect(quad.children[2].box.vertex.x).to.equal(quad.box.vertex.x+quad.box.width/2.0);
    expect(quad.children[2].box.vertex.y).to.equal(quad.box.vertex.y+quad.box.height/2.0);
    expect(quad.children[2].box.width).to.equal(quad.box.width/2.0);
    expect(quad.children[2].box.height).to.equal(quad.box.height/2.0);

    expect(quad.children[3].box.vertex.x).to.equal(quad.box.vertex.x);
    expect(quad.children[3].box.vertex.y).to.equal(quad.box.vertex.y+quad.box.height/2.0);
    expect(quad.children[3].box.width).to.equal(quad.box.width/2.0);
    expect(quad.children[3].box.height).to.equal(quad.box.height/2.0);
  });

  it('queryRange should return all points contained in the input box in the tree', function(){
    var p  = new Point(11, 14.2);   //should be in quad 0
    var p1 = new Point(62.4, 18.2); //should be in quad 1
    var p2 = new Point(75, 75);     //should be in quad 2
    var p3 = new Point(10, 83.2);   //should be in quad 3
    quad.insert(p).insert(p1).insert(p2).insert(p3);

    p = new Point(5, 5);
    var box = new Box(p, 10, 10);

    var result = quad.queryRange(box);
    expect(result.length).to.equal(1);
    expect(result[0].point.x).to.equal(11);
    expect(result[0].point.y).to.equal(14.2);
    expect(result[0].value).to.equal(undefined);

    p = new Point(5, 5);
    box = new Box(p, 63, 20);

    result = quad.queryRange(box);
    expect(result.length).to.equal(2);

    p = new Point(0, 0);
    box = new Box(p, 100, 100);

    result = quad.queryRange(box);
    expect(result.length).to.equal(4);    
  });

  // Add more assertions here
});
