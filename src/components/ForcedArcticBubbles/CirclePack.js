import React from 'react';
import * as R from 'ramda';
import * as d3 from 'd3';

const TEXT_PADDING = 5;

function wrapText(d) {
  let self = d3.select(this);
  let textLength = self.node().getComputedTextLength();
  let text = self.text();
  let xOffset = Math.min(d.radius - TEXT_PADDING, textLength / 2) * -1;
  const diameter = d.radius * 2;
  const maxTextLength = diameter - TEXT_PADDING * 2;

  self.attr('dx', xOffset);

  if (textLength > maxTextLength) {
    self.text('');
    xOffset = Math.min(d.radius - TEXT_PADDING, textLength / 2) * -1;
    self.attr('dx', xOffset);
  }
}

const updateBubblesRadius = (area, bubbles) => {
  const bArea = bubbles.reduce((a, b) => a + Math.PI * Math.pow(b.radius, 2), 0);
  const ratio = bArea / area;

  if (ratio > 0.45) {
    const _bubbles = bubbles.map(b => ({ ...b, radius: b.radius * 0.98 }));
    return updateBubblesRadius(area, _bubbles);
  }

  return bubbles;
};

const force = d3
  .forceSimulation()
  .force('center', d3.forceCenter())
  .force('collide', d3.forceCollide().radius(d => d.radius + 0.5))
  .force('charge', d3.forceManyBody().strength(() => 2));

class CirclePack extends React.Component {
  componentWillMount() {
    force.alphaDecay(1 - Math.pow(0.1, 1 / 200));
    force.on('tick', this.onTick);
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
    const { diameter = 300, data = [] } = this.props;
    const area = Math.PI * Math.pow(diameter / 2, 2);
    const nodes = updateBubblesRadius(area, data);

    force.stop();
    force.nodes(nodes);

    const bubbles = d3
      .select(this.ele)
      .selectAll('circle')
      .data(nodes);
    const texts = d3
      .select(this.ele)
      .selectAll('text')
      .data(nodes);

    bubbles.exit().remove();
    texts.exit().remove();
    bubbles
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    texts
      .text(d => d.text)
      .attr('dy', d => '0.35em')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .each(wrapText);
    force.restart();
    force.alpha(1);
  };

  onTick = e => {
    d3.select(this.ele)
      .selectAll('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    d3.select(this.ele)
      .selectAll('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  };

  render() {
    const { data = [], style } = this.props;
    const bubbles = data.map(d => (
      <g key={d.index}>
        <circle key={d.index + 'b'} />
        <text key={d.index + 't'} />
      </g>
    ));

    return (
      <g className="force-bubbles" ref={el => (this.ele = el)}>
        {bubbles}
      </g>
    );
  }
}

export default CirclePack;
