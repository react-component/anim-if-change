/* eslint no-console:0, react/no-multi-comp:0 */

import React from 'react';
import Animate from '../index';
import { supportTransition } from '../src/util';

import './index.spec.css';

import single from './single-common.spec';

function createClass(options) {
  return class extends React.Component {
    state = {
      transitionEnter: options.transitionEnter,
      transitionAppear: options.transitionAppear,
    }

    render() {
      console.log('!!!!!!!!!!!', options.remove && !this.state.transitionEnter);
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

if (supportTransition) {
  single(createClass, 'transition');
}
