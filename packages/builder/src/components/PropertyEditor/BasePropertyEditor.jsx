import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { getHandleValue } from '../../helpers/Utilities';

export default class BasePropertyEditor extends Component {
  static contextTypes = {
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
    }).isRequired,
    updateField: PropTypes.func.isRequired,
  };

  /**
   * @param props
   * @param context
   */
  constructor(props, context) {
    super(props, context);

    this.update = this.update.bind(this);
    this.updateHandle = this.updateHandle.bind(this);
    this.updateKeyValue = this.updateKeyValue.bind(this);
    this.updateChildField = this.updateChildField.bind(this);
    this.preprocessTarget = this.preprocessTarget.bind(this);
    this.compileProps = this.compileProps.bind(this);
  }

  /**
   * Updates a specific property
   *
   * @param {Event} event
   */
  update(event) {
    const { updateField } = this.context;
    const { name, value } = this.preprocessTarget(event.target);
    updateField({ [name]: value });
  }

  /**
   * Updates a specific property of a component if it is a child of some other component
   *
   * @param {Event} event
   * @param {string} childName name of this child in parent children context
   * @param {string} childrenProp name of a parent context property that contain this childs properties
   */
  updateChildField(event, childName = undefined, childrenProp = 'children') {
    const { updateField } = this.context;

    childName = childName === undefined ? this.constructor.getClassName() : childName;
    const { name, value } = this.preprocessTarget(event.target);
    const children = this.compileProps()[childrenProp];

    if (typeof children !== 'object') {
      throw `${childrenProp} property should be an object`;
    }

    const updatedChildren = { ...children };
    const child = updatedChildren[childName];

    if (typeof child !== 'object') {
      throw `${childrenProp}.${child} property should be an object`;
    }
    updatedChildren[childName] = { ...child, [name]: value };

    updateField({ [childrenProp]: updatedChildren });
  }

  /**
   * Extracts name and value from event target
   *
   * @param {EventTarget} target
   *
   * @returns {object} with name and value properties
   */
  preprocessTarget(target) {
    const { name, value, type, dataset, checked } = target;

    const isNumeric = dataset.isNumeric && dataset.isNumeric !== 'false';
    const isFloat = dataset.isFloat && dataset.isFloat !== 'false';
    const couldBeNumeric = dataset.couldBeNumeric && dataset.couldBeNumeric !== 'false';
    const isNullable = dataset.nullable && dataset.nullable !== 'false';

    let cleanValue = value;

    switch (type) {
      case 'checkbox':
        cleanValue = checked;
        break;
    }

    if (isNumeric) {
      cleanValue = (cleanValue + '').replace(/[^0-9\.]/, '');
      if (isFloat) {
        cleanValue = cleanValue ? parseFloat(cleanValue) : 0.0;
      } else {
        cleanValue = cleanValue ? parseInt(cleanValue) : 0;
      }
    }

    if (couldBeNumeric) {
      if (/^[0-9]+$/.test(cleanValue)) {
        cleanValue = cleanValue ? parseInt(cleanValue) : 0;
      }
    }

    if (isNullable) {
      cleanValue = cleanValue !== '' ? cleanValue : null;
    }

    return {
      name,
      value: cleanValue,
    };
  }

  /**
   * Updates a handle property, parsing out invalid characters
   *
   * @param event
   */
  updateHandle(event) {
    const { updateField } = this.context;
    const { name, value } = event.target;

    const handleValue = getHandleValue(value, false);

    updateField({ [name]: handleValue });
  }

  /**
   * Updates key and value manually
   *
   * @param key
   * @param value
   */
  updateKeyValue(key, value) {
    const { updateField } = this.context;

    updateField({ [key]: value });
  }

  /**
   * Returns a final set of properties overriding each other in this priority:
   * this.context['properties'] -> this.context['properties']['children'][this.constructor.name] -> this.props
   *
   * @param {string} childrenProp name of a parent context property that contain this childs properties
   *
   * @returns {object}
   */
  compileProps(childrenProp = 'children') {
    const { properties: contextProps } = this.context;
    const { [childrenProp]: children } = contextProps;
    const childrenProps = (children && children[this.constructor.getClassName()]) || {};
    const thisProps = this.props;

    return {
      ...contextProps,
      ...childrenProps,
      ...thisProps,
    };
  }
}
