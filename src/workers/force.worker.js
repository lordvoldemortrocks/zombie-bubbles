import * as d3 from 'd3';
import * as R from 'ramda';

function forceCluster(groups) {
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
}

export default function() {
  self.addEventListener('message', e => {
    if (!e) return;

    switch (e.data.type) {
      case 'force':
        const { nodes = [], slices = [], diameter = 300 } = e.data;
        const innerRadius = (diameter + 120) / 2;
        const outerRadius = innerRadius + 100;
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
          d._x = outerRadius * Math.sin(angle);
          d._y = outerRadius * Math.cos(angle) * -1;
        });

        const simulation = d3
          .forceSimulation(nodes)
          .force('collide', d3.forceCollide().radius(d => d.radius + 0.5))
          .force('radial', d3.forceRadial(outerRadius).strength(0.4))
          .force('cluster', forceCluster(groups).strength(0.9));
        const iterations = Math.ceil(
          Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
        );

        for (var i = 0; i < iterations; ++i) {
          postMessage({ type: 'tick', progress: i / iterations });
          simulation.tick();
        }

        postMessage({ type: 'end', nodes: nodes });
        break;

      case 'test':
        postMessage({ type: 'test', message: 'Hello, world!' });
        break;
    }
  });
}
