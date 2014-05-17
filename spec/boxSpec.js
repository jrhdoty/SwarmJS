/* global quadtree, describe, it, expect, should */

describe('Box', function () {
  'use strict';
  var box, box2, box3;

  beforeEach(function(){
    box  = new Box(new Point(0, 0), 10, 10);
    box2 = new Box(new Point(5, 5), 10, 10);
    box3 = new Box(new Point(11, 11), 10, 10);
  });

  it('exists', function () {
    expect(Box).to.be.a('function');

  });

  it('has functions containsPoint and overlaps', function () {
    expect(box.containsPoint).to.be.a('function');
    expect(box.overlaps).to.be.a('function');
  });

  it('detects an overlap correctly', function(){
    expect(box.overlaps(box2)).to.equal(true);
  });

  it('detects a lack of overlap correctly', function(){
    expect(box.overlaps(box3)).to.equal(false);
  });

  it('returns the correct top left quadrant', function(){
    var b = box.getQuadrant(0);
    expect(b.vertex.x).to.equal(0);
    expect(b.vertex.y).to.equal(0);
    expect(b.width).to.equal(5);
    expect(b.height).to.equal(5);
  });

  it('returns the correct top right quadrant', function(){
    var b = box.getQuadrant(1);
    expect(b.vertex.x).to.equal(5);
    expect(b.vertex.y).to.equal(0);
    expect(b.width).to.equal(5);
    expect(b.height).to.equal(5);
  });

  it('returns the correct bottom right quadrant', function(){
    var b = box.getQuadrant(2);
    expect(b.vertex.x).to.equal(5);
    expect(b.vertex.y).to.equal(5);
    expect(b.width).to.equal(5);
    expect(b.height).to.equal(5);
  });

  it('returns the correct bottom left quadrant', function(){
    var b = box.getQuadrant(3);
    expect(b.vertex.x).to.equal(0);
    expect(b.vertex.y).to.equal(5);
    expect(b.width).to.equal(5);
    expect(b.height).to.equal(5);
  });

  // Add more assertions here
});
