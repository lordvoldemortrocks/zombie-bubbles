import React from 'react';
import * as R from 'ramda';
import * as d3 from 'd3';

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

class ZombieBubbles extends React.Component {
  constructor(props) {
    super(props);

    const { diameter = 300 } = props;
    this.innerRadius = (diameter + 100) / 2;
    this.outerRadius = this.innerRadius + 50;
    this.force = null;
    this.arc = d3
      .arc()
      .outerRadius(this.outerRadius)
      .innerRadius(this.innerRadius)
      .padAngle(0.01);
  }

  componentWillMount() {
    this.force = d3
      .forceSimulation()
      .force('collide', d3.forceCollide().radius(d => d.radius + 0.5));
    this.force.alphaDecay(1 - Math.pow(0.001, 1 / 300));
    this.force.on('tick', this.onTick);
  }

  componentDidMount() {
    const { center } = this.props;
    d3.select(this.ele).attr('transform', `translate(${center[0]}, ${center[1]})`);
    this.renderBubbles();
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.renderBubbles();
    }
  }

  renderBubbles = () => {
    const { diameter = 300, data = [], slices = [] } = this.props;
    const randomRadius = d3.randomUniform(this.innerRadius, this.outerRadius);
    const groups = slices.reduce(
      (map, v) =>
        map.set(v.index, {
          center: this.arc.centroid(v),
          angleGenerator: d3.randomUniform(R.prop('startAngle', v), R.prop('endAngle', v))
        }),
      d3.map()
    );
    const _data = data.map((d, i) => {
      const { angleGenerator } = groups.get(d.group);
      const angle = angleGenerator();
      const arcRadius = randomRadius();
      return {
        ...d,
        _x: this.outerRadius * Math.sin(angle),
        _y: this.outerRadius * Math.cos(angle) * -1
      };
    });

    this.force.stop();
    this.force.force('radial', d3.forceRadial(this.outerRadius).strength(0.4));
    this.force.force('cluster', forceCluster(groups).strength(0.9));
    this.force.nodes(_data);

    const bubbles = d3
      .select(this.ele)
      .selectAll('circle')
      .data(_data);

    bubbles.exit().remove();
    bubbles
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    this.force.restart();
    this.force.alpha(1);
  };

  onTick = e => {
    d3.select(this.ele)
      .selectAll('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  };

  render() {
    const { data = [], style } = this.props;
    const bubbles = data.map(d => <circle key={d.index + 'b'} />);

    return (
      <g className="zombie-bubbles" ref={el => (this.ele = el)}>
        {bubbles}
      </g>
    );
  }
}

export default ZombieBubbles;
