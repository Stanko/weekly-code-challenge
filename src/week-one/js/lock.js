import React, { Component } from 'react';
import Plx from 'react-plx';

function generatePlxData(start = 0) {
  const keyframes = {
    zero: `${ 0 + start }vh`,
    one: `${ 50 + start }vh`,
    oneShort: `${ 50.5 + start }vh`,
    two: `${ 150 + start }vh`,
  };
  
  const lockPlxData = [
    {
      start: keyframes.zero,
      end: keyframes.one,
      properties: [
        {
          startValue: 0,
          endValue: 180,
          property: 'rotate',
        },
      ],
    },
  ];
  
  const leftPlxData = [
    {
      start: keyframes.one,
      end: keyframes.two,
      properties: [
        {
          startValue: 0,
          endValue: -200,
          unit: '%',
          property: 'translateX',
        },
      ],
    },
  ];
  
  const rightPlxData = [
    {
      start: keyframes.one,
      end: keyframes.oneShort,
      properties: [
        {
          startValue: 0,
          endValue: 4,
          unit: '%',
          property: 'translateX',
        },
      ],
    },
    {
      start: keyframes.oneShort,
      end: keyframes.two,
      properties: [
        {
          startValue: 4,
          endValue: 200,
          unit: '%',
          property: 'translateX',
        },
      ],
    },
  ];

  return {
    lock: lockPlxData,
    left: leftPlxData,
    right: rightPlxData,
  };
}

export default class Lock extends Component {
  constructor(props) {
    super(props);

    this.plxData = generatePlxData(props.start);
  }

  render() {
    return (
      <div className="lock">
        <Plx className="lock-left" parallaxData={this.plxData.left} />
        <Plx className="lock-right" parallaxData={this.plxData.right}>
          <Plx className="lock-lock" parallaxData={this.plxData.lock}>
            <svg viewBox="0 0 100 100">
              <path
                d="M 50 15 L 50 30 L 45 40 L 55 50 L 45 60 L 50 65 L 50 85"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Plx>
        </Plx>
      </div>
    );
  }
}
