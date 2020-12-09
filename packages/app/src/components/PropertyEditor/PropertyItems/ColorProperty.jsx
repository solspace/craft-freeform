import React from 'react';
import { SketchPicker } from 'react-color';
import BasePropertyItem from './BasePropertyItem';

export default class ColorProperty extends BasePropertyItem {
  static initialState = {
    displayColorPicker: false,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      ...ColorProperty.initialState,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  renderInput() {
    const { value, readOnly, disabled, className } = this.props;
    const { displayColorPicker } = this.state;

    const classes = [className];
    if (readOnly && disabled) {
      classes.push('code');
    }

    return (
      <div>
        <div className="freeform-colorpicker-preview-wrapper" onClick={this.handleClick}>
          <div className="freeform-colorpicker-preview" style={{ backgroundColor: value }} />
        </div>

        {displayColorPicker && !readOnly && !disabled && (
          <div className="freeform-colorpicker-wrapper">
            <div className="freeform-colorpicker-cover" onClick={this.handleClose} />
            <SketchPicker color={value} onChange={this.handleChange} disableAlpha={true} />
          </div>
        )}
      </div>
    );
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = (color) => {
    const { name } = this.props;

    this.props.onChangeHandler(name, color.hex);
  };
}
