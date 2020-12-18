import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty, MatrixEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import CustomProperty from './PropertyItems/CustomProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export const scaleColumns = [
  { handle: 'value', label: 'Value' },
  { handle: 'label', label: 'Label (Optional)' },
];

export const legendColumns = [{ handle: 'legend', label: 'Legend' }];

export default class OpinionScale extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.any,
      required: PropTypes.bool,
      options: PropTypes.array,
      legends: PropTypes.array,
    }).isRequired,
  };

  render() {
    const {
      properties: { label, value, handle, required, instructions },
    } = this.context;
    const {
      hash,
      properties: { scales = [], legends = [] },
    } = this.context;

    const usableValues = [];
    for (const scale of scales) {
      if (!scale.value) {
        continue;
      }

      usableValues.push({ key: scale.value, value: scale.label ? scale.label : scale.value });
    }

    return (
      <div>
        <TextProperty
          label="Handle"
          instructions="How you’ll refer to this field in the templates."
          name="handle"
          value={handle}
          onChangeHandler={this.updateHandle}
        />

        <TextProperty
          label="Label"
          instructions="Field label used to describe the field."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="This field is required?"
          name="required"
          checked={required}
          onChangeHandler={this.update}
        />

        <hr />

        <TextareaProperty
          label="Instructions"
          instructions="Field specific user instructions."
          name="instructions"
          value={instructions}
          onChangeHandler={this.update}
        />

        <SelectProperty
          label="Default Value"
          instructions="If present, this will be the value pre-populated when the form is rendered."
          name="value"
          emptyOption="--"
          options={usableValues}
          value={value}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <CustomProperty
          label="Options"
          content={<MatrixEditorProperty hash={hash} attribute={'scales'} columns={scaleColumns} values={scales} />}
        />

        <CustomProperty
          label="Legends"
          instructions="Legends"
          content={<MatrixEditorProperty hash={hash} attribute={'legends'} columns={legendColumns} values={legends} />}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
