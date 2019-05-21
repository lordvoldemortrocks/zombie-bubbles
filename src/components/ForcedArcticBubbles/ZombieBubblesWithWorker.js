import React, { useRef, useEffect } from 'react';
import * as R from 'ramda';
import * as d3 from 'd3';

const worker = new Worker('../../workers/force.worker');

const ZombieBubblesWithWorker = props => {
  const { center, data = [], style = {} } = props;
  const ele = useRef(null);
  const bubbles = data.map(d => <circle key={d.index + 'b'} />);
  const renderBubbles = () => {};

  useEffect(() => {
    d3.select(ele.current).attr('transform', `translate(${center[0]}, ${center[1]})`);
    worker.onmessage = e => {
      debugger;
      if (!e) return;

      switch (e.data.type) {
        case 'test':
          console.log(e.data.message);
          break;
      }
    };
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
