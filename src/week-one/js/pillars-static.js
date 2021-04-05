import React, { Component } from 'react';

export default class PillarsStatic extends Component {
  render() {
    return (
      <div className="pillars">
        {[0,1,2,3,4,5,6,7].map(index => {
          return <div key={index} className="pillars-pillar" />  
        })}
      </div>
    );
  }
}
