/* global quadtree, describe, it, expect, should */

describe('Box', function () {
  'use strict';
  var box, box2, box3, box4;
  var point, point1, point2, point3, point4, point5, point6, point7;

  beforeEach(function(){
    point  = new Point(0, 0);
    point1 = new Point(10, 10);
    point2 = new Point(20, 20);
    point3 = new Point(15, 15);
    point4 = new Point(5, 15);
    point5 = new Point(10, 30);
    point6 = new Point(21, 21);
    point7 = new Point(30, 30);


    box  = new Box(point, point2);
    box2 = new Box(point1, point3);
    box3 = new Box(point6, point7);
    box4 = new Box(point, point2);
  });

  it('exists', function () {
    expect(Box).to.be.a('function');

  });

  it('has functions containsPoint and overlaps', function () {
    expect(box.containsPoint).to.be.a('function');
    expect(box.overlaps).to.be.a('function');
  });

  it('detects that a point is contained correctly', function(){
    expect(box.containsPoint(point1)).to.equal(true);
    expect(box.containsPoint(point5)).to.equal(false);
  });

  it('detects an overlap correctly', function(){
    expect(box.overlaps(box2)).to.equal(true);
    expect(box.overlaps(box3)).to.equal(false);
    expect(box.overlaps(box4)).to.equal(true);

    var b = new Box(new Point(5, 0), new Point(10, 5));
    expect(box.overlaps(b)).to.equal(true);

    var b = new Box(new Point(50, 0), new Point(100, 50));
    var b1 = new Box(new Point(0, 0), new Point(100, 100));
    expect(b.overlaps(b1)).to.equal(true);
  });

  it('returns correct quadrants when split', function(){
    var results = box.split();
    expect(results[0].low.x).to.equal(0);
    expect(results[0].low.y).to.equal(0);
    expect(results[0].high.x).to.equal(10);
    expect(results[0].high.y).to.equal(10);

    expect(results[1].low.x).to.equal(10);
    expect(results[1].low.y).to.equal(0);
    expect(results[1].high.x).to.equal(20);
    expect(results[1].high.y).to.equal(10);

    expect(results[2].low.x).to.equal(10);
    expect(results[2].low.y).to.equal(10);
    expect(results[2].high.x).to.equal(20);
    expect(results[2].high.y).to.equal(20);

    expect(results[3].low.x).to.equal(0);
    expect(results[3].low.y).to.equal(10);
    expect(results[3].high.x).to.equal(10);
    expect(results[3].high.y).to.equal(20);
  });
  // Add more assertions here
});
