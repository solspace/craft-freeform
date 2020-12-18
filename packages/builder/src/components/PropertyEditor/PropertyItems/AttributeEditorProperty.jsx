import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate } from '../../../app';
import { CustomProperty, MatrixEditorProperty } from './';

export const attributeColumns = [
  { handle: 'attribute', label: 'Attribute' },
  { handle: 'value', label: 'Value' },
];

export default class AttributeEditorProperty extends Component {
  static contextTypes = {
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      inputAttributes: PropTypes.array,
      labelAttributes: PropTypes.array,
      errorAttributes: PropTypes.array,
      instructionAttributes: PropTypes.array,
    }).isRequired,
  };

  render() {
    const { hash, properties } = this.context;
    const { inputAttributes = [], labelAttributes = [], errorAttributes = [], instructionAttributes = [] } = properties;
    const instructions = 'Add any tag attributes to the HTML element.';

    return (
      <div className="field">
        <hr />

        <h4>{translate('Attribute Editor')}</h4>

        <CustomProperty
          label="Input"
          instructions={instructions}
          content={
            <MatrixEditorProperty
              hash={hash}
              attribute={'inputAttributes'}
              columns={attributeColumns}
              values={inputAttributes}
            />
          }
        />

        <CustomProperty
          label="Label"
          instructions={instructions}
          content={
            <MatrixEditorProperty
              hash={hash}
              attribute={'labelAttributes'}
              columns={attributeColumns}
              values={labelAttributes}
            />
          }
        />

        <CustomProperty
          label="Error"
          instructions={instructions}
          content={
            <MatrixEditorProperty
              hash={hash}
              attribute={'errorAttributes'}
              columns={attributeColumns}
              values={errorAttributes}
            />
          }
        />

        <CustomProperty
          label="Instruction"
          instructions={instructions}
          content={
            <MatrixEditorProperty
              hash={hash}
              attribute={'instructionAttributes'}
              columns={attributeColumns}
              values={instructionAttributes}
            />
          }
        />
      </div>
    );
  }
}
