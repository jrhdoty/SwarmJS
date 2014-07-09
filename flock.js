var centerOfMass = {
  causes: ['bird'],
  areaOfEffect: 25,
  strength: 1,
  calculate: function(agent, neighbors){
    //head toward neighbors center of mass
    var result = new Vector(0, 0);
    if(neighbors.length === 0){
      return result;
    }

    for (var i = 0; i < neighbors.length; i++) {
      result = result.add(neighbors[i].position);
    }

    result.top /= neighbors.length;     //find the center of mass
    result.top -=agent.position.top;   //find the difference b/w current position and CoM
    result.left /= neighbors.length;      //same as above
    result.left -= agent.position.left;
    return result;
  }
};

var matchHeading = {
  causes: ['bird'],
  areaOfEffect: 25,
  strength: 20,
  calculate: function(agent, neighbors){
    //match heading with neighbors
    var result = new Vector(0, 0);
    if(neighbors.length === 0 || neighbors === undefined){
      return result;
    }

    for (var i = 0; i < neighbors.length; i++) {
      result = result.add(neighbors[i].velocity);
    }

    result.top /= neighbors.length;     //find the result of mass
    result.left /= neighbors.length;      //same as above
    return result;
  }
};

var avoidCollisions = {
  causes: ['bird'],
  areaOfEffect: 10,
  strength: 5,
  calculate: function(agent, neighbors){
    //match heading with neighbors
    var result = new Vector(0, 0);
    if(neighbors.length === 0 || neighbors === undefined){
      return result;
    }

    for (var i = 0; i < neighbors.length; i++) {
      // result = result.add(agent.position.add(neighbors[i].position));
      result.top += agent.position.top - neighbors[i].position.top;  //determine the repulsion vector and add to final resultant
      result.left += agent.position.left - neighbors[i].position.left;
    }

    result.top /= neighbors.length;     //find the result of mass
    result.left /= neighbors.length;      //same as above
    return result;
  }
};


var momentum = {
  causes: [],
  areaOfEffect: 0,
  strength: .99,
  calculate: function(agent, neighbors){
    //match heading with neighbors
    return agent.velocity;
  }
};

var boundaryAvoidance = {
  causes: [],
  areaOfEffect: 0,
  strength: 50,
  calculate: function(agent, neighbors){
    bounds =  [20, 20, window.innerHeight, window.innerWidth];
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
  }
};


var opts = {
  type:     'bird',
  forces:   [centerOfMass, matchHeading, avoidCollisions, momentum, boundaryAvoidance],
  position: new Vector(100, 100),
  velocity:  new Vector(1, 1),
};


var population = [];
population.push(new Agent(opts));
for( var i = 0; i < 1000; i++ ){
  opts.position = new Vector(Math.random()*window.innerWidth, Math.random()*window.innerHeight);
  opts.velocity = new Vector((Math.random()-.5)*1, (Math.random()-.5)*1);
  population.push(new Agent(opts));
}

window.swarm = new Swarm(population, 0, 0, window.innerWidth, window.innerHeight);


