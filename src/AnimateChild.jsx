import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import classNames from 'classnames';

import { cloneProps, getTransitionName, supportTransition } from './util';

const clonePropList = [
  'appeared',
  'show',
  'exclusive',
  'children',
];

/**
 * AnimateChild only accept one child node.
 */

class AnimateChild extends React.Component {
  static propTypes = {
    transitionName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    transitionAppear: PropTypes.bool,
    transitionEnter: PropTypes.bool,
    transitionLeave: PropTypes.bool,
    exclusive: PropTypes.bool,
    appeared: PropTypes.bool,
    showProp: PropTypes.string,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevProps = {} } = prevState;
    const {
      transitionName, transitionAppear, transitionEnter, transitionLeave,
      exclusive, appeared,
    } = nextProps;

    const newState = {
      prevProps: cloneProps(nextProps, clonePropList),
    };

    function processState(propName, updater) {
      if (prevProps[propName] !== nextProps[propName]) {
        if (updater) {
          updater(nextProps[propName]);
        }
        return true;
      }
      return false;
    }

    function pushTransition(transition) {
      newState.transitionQueue = newState.transitionQueue || prevState.transitionQueue;
      if (exclusive) {
        newState.transitionQueue = [transition];
        newState.transitionActive = false;
      } else {
        newState.transitionQueue.push(transition);
      }
    }

    // Child update. Only set child.
    processState('children', (child) => {
      newState.child = child;
    });

    processState('appeared', (isAppeared) => {
      if (isAppeared && transitionAppear) {
        pushTransition({
          basic: getTransitionName(transitionName, 'appear'),
          active: getTransitionName(transitionName, 'appear-active'),
        });
      }
    });

    // Show update
    processState('show', (show) => {
      if (!appeared && show && transitionEnter) {
        pushTransition({
          basic: getTransitionName(transitionName, 'enter'),
          active: getTransitionName(transitionName, 'enter-active'),
        });
      } else if (!appeared && !show && transitionLeave) {
        pushTransition({
          basic: getTransitionName(transitionName, 'leave'),
          active: getTransitionName(transitionName, 'leave-active'),
        });
      }
    });

    // exclusive
    processState('exclusive', (isExclusive) => {
      if (isExclusive) {
        const transitionQueue = newState.transitionQueue || prevState.transitionQueue;
        newState.transitionQueue = transitionQueue.slice(-1);
        if (transitionQueue.length !== 1) {
          newState.transitionActive = false;
        }
      }
    });

    return newState;
  }

  state = {
    child: null,
    transitionQueue: [],
    transitionActive: false,
  }

  componentDidMount() {
    this.onDomUpdated();
  }

  componentDidUpdate() {
    this.onDomUpdated();
  }

  onDomUpdated = () => {
    const { transitionQueue, transitionActive } = this.state;
    const transition = transitionQueue[0];

    if (transition && !transitionActive) {
      // requestAnimationFrame not support in IE 9-
      // Use setTimeout instead
      setTimeout(() => {
        this.setState({ transitionActive: true });
      });
    }
  };

  onMotionEnd = ({ target }) => {
    const { transitionQueue } = this.state;
    if (!transitionQueue.length) return;

    const $ele = ReactDOM.findDOMNode(this);
    if ($ele === target) {
      this.setState({
        transitionQueue: transitionQueue.slice(1),
      });
    }
  }


  render() {
    const { child, transitionQueue, transitionActive } = this.state;
    const { showProp } = this.props;
    const { className, onTransitionEnd, onAnimationEnd } = child.props || {};

    // Class name
    const transition = transitionQueue[0];
    const connectClassName = (supportTransition && transition) ? classNames(
      className,
      transition.basic,
      transitionActive && transition.active,
    ) : className;

    let show = true;
    if (supportTransition && transition) {
      show = true;
    } else {
      show = child.props[showProp];
    }

    // Clone child
    return React.cloneElement(child, {
      className: connectClassName,
      [showProp]: show,

      onTransitionEnd: (...args) => {
        this.onMotionEnd(...args);
        if (onTransitionEnd) {
          onTransitionEnd(...args);
        }
      },
      onAnimationEnd: (...args) => {
        this.onMotionEnd(...args);
        if (onAnimationEnd) {
          onAnimationEnd(...args);
        }
      },
    });
  }
}

polyfill(AnimateChild);

export default AnimateChild;