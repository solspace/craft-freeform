import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tab from './Tab';

const MAX_TABS = 100;

export default class TabList extends Component {
  static propTypes = {
    layout: PropTypes.array.isRequired,
    properties: PropTypes.object.isRequired,
    currentPageIndex: PropTypes.number.isRequired,
    onTabClick: PropTypes.func.isRequired,
    onNewTab: PropTypes.func.isRequired,
    tabCount: PropTypes.number.isRequired,
  };

  render() {
    const { layout, currentPageIndex, onTabClick, onNewTab, tabCount } = this.props;

    return (
      <div className="tab-list-wrapper">
        <ul>
          {layout.map((row, index) => (
            <Tab
              key={index}
              index={index}
              label={this.getLabel(index)}
              onClick={() => onTabClick(index)}
              isSelected={index == currentPageIndex}
            />
          ))}
        </ul>

        {tabCount < MAX_TABS && (
          <div className="tab-list-controls">
            <a className="new" onClick={() => onNewTab(layout.length)}></a>
          </div>
        )}
      </div>
    );
  }

  getLabel(pageIndex) {
    const { properties } = this.props;

    if (properties['page' + pageIndex]) {
      return properties['page' + pageIndex].label;
    }

    return null;
  }
}
