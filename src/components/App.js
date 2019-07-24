import React from 'react';
import * as d3 from 'd3';
import * as R from 'ramda';
import BubbleViz from './ForcedArcticBubbles/ForcedArcticBubbles';
import { MOCK_DATA } from './mock';
import './App.css';

const randomBtw = (min = 1, max = 1) => {
  return Math.floor(Math.random() * Math.max(1, max) + Math.max(0, min));
};

const DARK_COLORS = ['#5D99D2', '#EC7B3A', '#845EA4', '#8BC64D'];

const LIGHT_COLORS = ['#8CB7E0', '#F1A270', '#A88CBF', '#B8DC8E'];

const generateBubbles = (count = 20) =>
  d3.range(randomBtw(count, count + 20)).map((x, i) => ({
    index: i,
    radius: randomBtw(40, 80),
    color: '#bdc1d3',
    text: Math.random()
      .toString(16)
      .substring(2, randomBtw(7, 12))
  }));

const generateZombies = (count = 0) => {
  const getPercentage = R.pipe(
    R.divide(R.__, count),
    R.multiply(100)
  );
  const groupGenerator = () => (Math.random() * 4) | 0;
  const radiusGenerator = d3.randomUniform(4, 10);
  const zombies = d3.range(count).map((x, i) => {
    const group = Math.floor(groupGenerator());

    return {
      index: i,
      group: group,
      color: LIGHT_COLORS[group],
      radius: radiusGenerator(),
      text: Math.random()
        .toString(16)
        .substring(2, randomBtw(7, 12))
    };
  });
  const percentages = R.pipe(
    R.reduce((a, x) => R.over(R.lensIndex(x.group), R.inc, a), R.repeat(0, 4)),
    R.map(getPercentage)
  )(zombies);
  const slices = count
    ? d3
        .pie()(d3.range(4).map((x, i) => percentages[i]))
        .map(x => ({ ...x, color: DARK_COLORS[x.index] }))
    : [];

  return {
    slices,
    zombies
  };
};

class App extends React.Component {
  componentDidMount() {
    this.updateData();
  }

  updateData = () => {
    this.setState({
      bubbles: generateBubbles(20),
      ...generateZombies(500)
    });
  };

  render() {
    return (
      <div className="App">
        <button onClick={this.updateData}>Update Data</button>
        <BubbleViz width={1000} height={800} diameter={300} {...this.state} />
      </div>
    );
  }
}

export default App;
