import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Tooltip } from 'react-tippy';
import { translate } from '../../../app';

export default class BasePropertyItem extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    instructions: PropTypes.string,
    name: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.node,
    onChangeHandler: PropTypes.func,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    isNumeric: PropTypes.bool,
    isFloat: PropTypes.bool,
    couldBeNumeric: PropTypes.bool,
    required: PropTypes.bool,
    nullable: PropTypes.bool,
    translationCategory: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);

    this.renderInput = this.renderInput.bind(this);
  }

  render() {
    const { label, instructions, required } = this.props;

    return (
      <div className="composer-property-item field">
        <div className="composer-property-heading heading">
          <label className={required ? 'required' : ''}>{this.translate(label)}</label>
          {instructions && (
            <Tooltip
              title={this.translate(instructions)}
              position="bottom-start"
              theme="light"
              className="ff-info"
              arrow={true}
            />
          )}
        </div>
        <div className="composer-property-input">{this.renderInput()}</div>
        {this.props.children}
      </div>
    );
  }

  renderInput() {
    return "You should not use the 'BasePropertyItem'";
  }

  translate = (string, params) => {
    const { translationCategory = 'freeform' } = this.props;

    return translate(string, params, translationCategory);
  };
}
