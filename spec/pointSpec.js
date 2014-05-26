/* global quadtree, describe, it, expect, should */

describe('Point', function () {
  'use strict';
  var point1, point2, point3, point4, point5, point6;

  beforeEach(function(){
    point1 = new Point(10, 10);
    point2 = new Point(20, 20);
    point3 = new Point(15, 15);
    point4 = new Point(5, 15);
    point5 = new Point(0, 0);
    point6 = new Point(15, 5);
  });

  it('exists', function () {
    expect(Box).to.be.a('function');

  });

  it('has functions lt and gt', function () {
    expect(point1.lt).to.be.a('function');
    expect(point1.gt).to.be.a('function');
  });

  it('should have correctly functioning ls function', function(){
    expect(point1.lt(point2)).to.equal(true);
    expect(point1.lt(point5)).to.equal(false);
    expect(point1.lt(point4)).to.equal(false);
    expect(point1.lt(point6)).to.equal(false);
  });

  it('should have correctly functioning ls function', function(){
    expect(point2.gt(point1)).to.equal(true);
    expect(point5.gt(point1)).to.equal(false);
    expect(point5.gt(point1)).to.equal(false);
    expect(point6.gt(point1)).to.equal(false);
  });
});
