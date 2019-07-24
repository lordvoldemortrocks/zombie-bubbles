import React, { useRef, useEffect } from 'react';
import * as R from 'ramda';
import * as d3 from 'd3';
import ForceWorker from 'workerize-loader!../../workers/force.worker'; // eslint-disable-line import/no-webpack-loader-syntax

const worker = ForceWorker();
worker.sayHello({ text: 'Hello!', people: ['World', 'Kasim', 'John', 'Doe'], age: 200000000 });

const ZombieBubblesWithWorker = props => {
  const { center, diameter, data = [], slices = [], style = {} } = props;
  const ele = useRef(null);
  const bubbles = data.map(d => <circle key={d.index + 'b'} />);
  const renderBubbles = async () => {
    const nodes = await worker.calculateForces({ nodes: data, slices, diameter });
    const bubbles = d3
      .select(ele.current)
      .selectAll('circle')
      .data(nodes);
    bubbles
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  };

  useEffect(() => {
    d3.select(ele.current).attr('transform', `translate(${center[0]}, ${center[1]})`);
    renderBubbles();
  }, []);

  useEffect(() => {
    renderBubbles();
  }, [data]);

  return (
    <g className="zombie-bubbles" ref={ele}>
      {bubbles}
    </g>
  );
};

export default ZombieBubblesWithWorker;
