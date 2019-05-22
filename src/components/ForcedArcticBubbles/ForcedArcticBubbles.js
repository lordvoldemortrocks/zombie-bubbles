import React from 'react';
import ForceBubbles from './CirclePack';
import InteractiveArc from './ArcticWall';
import ZombieBubbles from './ZombieBubbles';
import ZombieBubblesWithWorker from './ZombieBubblesWithWorker';

class ForcedArcticBubbles extends React.Component {
  render() {
    const {
      children,
      style,
      width,
      height,
      diameter = 300,
      bubbles = [],
      slices = [],
      zombies = []
    } = this.props;
    const center = [width / 2, height / 2];

    return (
      <div className="bubble-viz">
        <svg ref={el => (this.svgEl = el)} height={height} width={width}>
          <ForceBubbles parentEl={this.svgEl} center={center} data={bubbles} diameter={diameter} />
          <InteractiveArc parentEl={this.svgEl} center={center} data={slices} diameter={diameter} />
          <ZombieBubblesWithWorker
            parentEl={this.svgEl}
            center={center}
            data={zombies}
            slices={slices}
            diameter={diameter}
            width={width}
            height={height}
          />
        </svg>
      </div>
    );
  }
}

export default ForcedArcticBubbles;
