import React, { Component } from 'react';
import Lock from './lock';
import Pillars from './pillars';
import Hole from './hole';
import PillarsStatic from './pillars-static';

export default class Main extends Component {
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, { passive: true });
  }

  handleScroll = () => {
    const bodyHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const maxScroll = bodyHeight - window.innerHeight;

    if (window.scrollY >= maxScroll - 100) {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0;
    }
  }

  render() {
    return (
      <div className="main">
        <Pillars start={0} />
        <Lock start={120} />
        <Hole start={250} />
        <PillarsStatic />
      </div>
    );
  }
}