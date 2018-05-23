/* eslint no-console:0, react/no-multi-comp:0 */

import React from 'react';
import CssAnimation from 'css-animation';
import Animate from '../index';

import './index.spec.css';

import single from './single-common.spec';

function createClass(options) {
  return class extends React.Component {
    state = {
      transitionEnter: options.transitionEnter,
      transitionAppear: options.transitionAppear,
    }

    render() {
      return (
        <Animate
          transitionAppear={!!this.state.transitionAppear}
          transitionName="example"
          component={options.component}
        >
          {options.remove && !this.state.transitionEnter ? null : <div key="1">child element</div>}
        </Animate>
      );
    }
  };
}
if (CssAnimation.isCssAnimationSupported) {
  single(createClass, 'transition');
}
