import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AddNewField from './FieldList/Components/AddNewField';

export default class AlwaysNearbyBox extends Component {
  static scrollbarWidth = null;
  static viewableAreaSize = 0;
  static padding = 10;

  static propTypes = {
    className: PropTypes.string,
    stickyTop: PropTypes.node,
    staticOffsetTop: PropTypes.number,
  };

  parentWidth = 0;
  parentPaddingX = 15;
  headerOffsetTop = 0;

  constructor(props, context) {
    super(props, context);

    this.handleScroll = this.handleScroll.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.updateOffsetDimensions = this.updateOffsetDimensions.bind(this);
  }

  componentDidMount() {
    const { wrapper, stickyTop, children } = this.refs;

    wrapper.style.position = 'fixed';
    wrapper.style.top = '0px';
    wrapper.style.overflowY = 'auto';
    wrapper.style.width = '0px';

    children.style.position = 'relative';
    stickyTop.style.position = 'fixed';
    stickyTop.style.width = '0px';

    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener(AddNewField.EVENT_AFTER_UPDATE, this.handleScroll);

    if (AlwaysNearbyBox.scrollbarWidth === null) {
      const inner = document.createElement('p');
      inner.style.width = '100%';
      inner.style.height = '200px';

      const outer = document.createElement('div');
      outer.style.position = 'absolute';
      outer.style.top = '0px';
      outer.style.left = '0px';
      outer.style.visibility = 'hidden';
      outer.style.width = '200px';
      outer.style.height = '150px';
      outer.style.overflow = 'hidden';
      outer.appendChild(inner);

      document.body.appendChild(outer);
      const w1 = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      let w2 = inner.offsetWidth;
      if (w1 === w2) {
        w2 = outer.clientWidth;
      }

      document.body.removeChild(outer);

      AlwaysNearbyBox.scrollbarWidth = w1 - w2;
    }

    this.updateOffsetDimensions();
    this.handleScroll();
  }

  componentDidUpdate() {
    this.updateOffsetDimensions();
    this.handleScroll();
  }

  componentWillUnmount() {
    const { wrapper, stickyTop, children } = this.refs;

    wrapper.style.position = '';
    wrapper.style.top = '';
    wrapper.style.overflowY = '';
    wrapper.style.width = '';

    children.style.position = '';
    stickyTop.style.position = '';
    stickyTop.style.width = '';

    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener(AddNewField.EVENT_AFTER_UPDATE, this.handleScroll);
  }

  updateOffsetDimensions() {
    const builder = document.getElementById('freeform-builder'),
      self = ReactDOM.findDOMNode(this),
      parentNode = self.parentNode;

    let offset = this.props.staticOffsetTop ? this.props.staticOffsetTop : 0;
    let elem = builder;

    do {
      if (!isNaN(elem.offsetTop)) {
        offset += elem.offsetTop;
      }
    } while ((elem = elem.offsetParent));

    this.headerOffsetTop = offset;
    AlwaysNearbyBox.viewableAreaSize =
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this.parentWidth = parentNode.clientWidth;
  }

  handleWindowResize() {
    this.updateOffsetDimensions();
    this.handleScroll();
  }

  handleScroll() {
    const { wrapper, stickyTop, children } = this.refs;

    let offsetY = AlwaysNearbyBox.padding,
      height = AlwaysNearbyBox.viewableAreaSize - AlwaysNearbyBox.padding * 2;

    const offsetFromHeader = window.scrollY - this.headerOffsetTop;

    if (offsetFromHeader < 0) {
      offsetY = Math.abs(offsetFromHeader) + AlwaysNearbyBox.padding;
      height -= offsetY;
    }

    wrapper.style.top = offsetY + 'px';
    wrapper.style.height = height + 'px';
    wrapper.style.width = this.parentWidth - this.parentPaddingX * 2 + 'px';

    if (stickyTop) {
      children.style.top = stickyTop.clientHeight + 'px';
      stickyTop.style.width = wrapper.clientWidth + 'px';
      children.style.top = stickyTop.clientHeight + 'px';
    }
  }

  render() {
    return (
      <div className={this.props.className} ref="wrapper">
        <div ref="stickyTop" className="sticky">
          {this.props.stickyTop}
        </div>
        <div ref="children" style={{ padding: '0' }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
