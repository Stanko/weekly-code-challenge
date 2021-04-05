import React, { Component } from 'react';
import Plx from 'react-plx';

function generatePillarsPlxData(start = 0) {
  return [0,1,2,3,4,5,6,7].map(index => {
    const delay = index * 10;
    return [
      {
        start: `${ start + delay }vh`,
        duration: '50vh',
        properties: [
          {
            startValue: 0,
            endValue: index % 2 === 0 ? 110 : -110,
            property: 'translateY',
            unit: '%',
          },
        ],
      },
    ];
  });
}

export default class Pillars extends Component {
  constructor(props) {
    super(props);

    this.pillarsPlxData = generatePillarsPlxData(props.start);
  }

  render() {
    return (
      <div className="pillars">
        {[0,1,2,3,4,5,6,7].map(index => {
          return <Plx animateWhenNotInViewport key={index} className="pillars-pillar" parallaxData={this.pillarsPlxData[index]} />  
        })}
      </div>
    );
  }
}
