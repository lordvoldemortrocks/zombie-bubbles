import * as d3 from 'd3';
import * as R from 'ramda';

const forceCluster = groups => {
  let strength = 0.1;
  let nodes = [];

  function force(alpha) {
    const l = alpha * strength;

    for (let i = 0; i < nodes.length; i++) {
      const d = nodes[i];
      d.vx -= (d.x - d._x) * l;
      d.vy -= (d.y - d._y) * l;
    }
  }

  force.initialize = _ => {
    nodes = _;
  };

  force.strength = (_ = 0) => {
    strength = _;
    return force;
  };

  return force;
};

export const sayHello = props => {
  // console.log('sayHello', props);
  console.log('Hello, world!');
};

export const calculateForces = props => {
  // console.log('calculateForces', props);
  const { nodes = [], slices = [], diameter = 300 } = props;
  const innerRadius = (diameter + 150) / 2;
  const outerRadius = innerRadius + 80;
  const arc = d3
    .arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius)
    .padAngle(0.01);
  const groups = slices.reduce(
    (acc, v) => ({
      ...acc,
      [v.index]: {
        angleGenerator: d3.randomUniform(R.prop('startAngle', v), R.prop('endAngle', v))
      }
    }),
    {}
  );
  nodes.forEach((d, i) => {
    const { angleGenerator } = groups[d.group];
    const angle = angleGenerator();
    d._x = (innerRadius + d.radius) * Math.sin(angle);
    d._y = (innerRadius + d.radius) * Math.cos(angle) * -1;
  });

  const simulation = d3
    .forceSimulation(nodes)
    .force('collide', d3.forceCollide().radius(d => d.radius + 0.5))
    .force('radial', d3.forceRadial(innerRadius).strength(0.4))
    .force('cluster', forceCluster(groups).strength(0.9));
  const iterations = Math.ceil(
    Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
  );

  console.log('iterations', iterations);

  for (var i = 0; i <= iterations; ++i) {
    simulation.tick();
  }

  return nodes;
};
