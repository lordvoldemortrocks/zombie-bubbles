import React from 'react';
import * as R from 'ramda';
import * as d3 from 'd3';

const color = d3.scaleOrdinal(d3.schemePastel1);

function arcTween(arc) {
  return function(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(0);
    return t => arc(i(t));
  };
}

function fillTween(a) {
  const i = d3.interpolateRgb(this._current.color, a.color);
  this._current = i(0);
  return t => i(t);
}

function eachArc(d) {
  this._current = d;
}

class ArcticWall extends React.Component {
  componentDidMount() {
    const { center } = this.props;
    d3.select(this.ele).attr('transform', `translate(${center[0]}, ${center[1]})`);
    this.renderSlices();
  }

  componentDidUpdate(prev) {
    if (this.props.data !== prev.data) {
      this.renderSlices();
    }
  }

  renderSlices = () => {
    const { diameter = 300, data = [] } = this.props;
    const innerRadius = diameter / 2;
    const outerRadius = innerRadius + innerRadius * 0.1;

    const arc = d3
      .arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .padAngle(0.01);
    const arcs = d3
      .select(this.ele)
      .selectAll('path')
      .data(data);
    arcs.exit().remove();
    arcs
      .transition()
      .duration(250)
      .attrTween('d', arcTween(arc))
      .attrTween('fill', fillTween);
    arcs
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.color)
      .each(eachArc);
  };

  render() {
    return <g className="interactive-arc" ref={el => (this.ele = el)} />;
  }
}

export default ArcticWall;
