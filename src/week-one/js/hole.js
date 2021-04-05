import React, { Component } from 'react';
import Plx from 'react-plx';

export default class Hole extends Component {
  componentDidMount() {
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.removeEventListener('resize', this.handleResize, { passive: true });
  }

  handleResize = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.forceUpdate();
    }, 50);
  };

  getPlxData() {
    const { start } = this.props;

    return [
      {
        start: `${start}vh`,
        duration: '200vh',
        properties: [
          {
            startValue: 1,
            endValue: 100,
            unit: '%',
            property: 'width',
          },
          {
            startValue: 1,
            endValue: 100,
            unit: '%',
            property: 'height',
          },
        ],
      },
    ];
  }

  render() {
    return (
      <div className="hole">
        <table className="hole-table">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <Plx
                tagName="td"
                className="hole-plx"
                parallaxData={this.getPlxData()}
              />
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
