import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import { connect } from 'react-redux';
import BasePropertyEditor from './BasePropertyEditor';
import PositionProperty from './Components/Submit/PositionProperty';
import { AttributeEditorProperty } from './PropertyItems';
import TextProperty from './PropertyItems/TextProperty';

@connect((state) => ({
  properties: state.composer.properties,
  hash: state.context.hash,
}))
export default class Save extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      url: PropTypes.string,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {
      hash,
      properties: { label, position, url },
    } = this.context;

    return (
      <div>
        <TextProperty
          label="Hash"
          instructions="Used to access this field on the frontend."
          name="handle"
          value={hash}
          className="code"
          readOnly={true}
        />

        <TextProperty
          label="Save button Label"
          instructions="The label of the Save &amp; Continue Later button."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <hr />

        <TextProperty
          label="Return URL"
          instructions="The URL the user will be redirected to after saving. Can use {token} and {key}."
          name="url"
          value={url}
          onChangeHandler={this.update}
        />

        <h4>{translate('Configuration')}</h4>

        <PositionProperty position={position} onChangeHandler={this.update} />

        <AttributeEditorProperty />
      </div>
    );
  }
}
