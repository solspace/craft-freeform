import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from '../../../../../app';
import * as FieldTypes from '../../../../../constants/FieldTypes';
import MappingRow from './MappingRow';

@connect((state) => ({
  properties: state.composer.properties,
  fields: state.craftFields,
}))
export default class MappingTable extends Component {
  static propTypes = {
    externalFieldColumnLabel: PropTypes.string,
    internalFieldColumnLabel: PropTypes.string,
    specificFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        handle: PropTypes.string.isRequired,
      }).isRequired
    ),
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        handle: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    fieldLayoutFieldIds: PropTypes.array,
    mapping: PropTypes.object,
    onChangeHandler: PropTypes.func.isRequired,
  };

  render() {
    const { externalFieldColumnLabel, internalFieldColumnLabel } = this.props;

    return (
      <div className="composer-option-table">
        <table>
          <thead>
            <tr>
              <th>{translate(externalFieldColumnLabel ? externalFieldColumnLabel : 'Craft Field')}</th>
              <th>{translate(internalFieldColumnLabel ? internalFieldColumnLabel : 'Freeform Field')}</th>
            </tr>
          </thead>

          <tbody ref="items">{this.renderRows()}</tbody>
        </table>
      </div>
    );
  }

  /**
   * Render each ROW element
   *
   * @returns {Array}
   */
  renderRows() {
    const { specificFields = [], fields = [], mapping, fieldLayoutFieldIds } = this.props;
    const formFields = this.getFormFields();

    const combinedFields = [...specificFields];
    for (const field of fields) {
      if (fieldLayoutFieldIds.indexOf(field.id) !== -1) {
        combinedFields.push(field);
      }
    }

    const children = [];
    combinedFields.map((field, i) => {
      children.push(
        <MappingRow
          key={i}
          handle={field.handle}
          label={field.name}
          required={false}
          formFields={formFields}
          mappedFormField={mapping && mapping[field.handle] ? mapping[field.handle] : ''}
          onChangeHandler={this.updateMappings}
        />
      );
    });

    return children;
  }

  getFormFields = () => {
    const { properties } = this.props;

    const formFields = [];
    for (const key in properties) {
      if (!properties.hasOwnProperty(key)) {
        continue;
      }

      const prop = properties[key];
      if (FieldTypes.INTEGRATION_SUPPORTED_TYPES.indexOf(prop.type) === -1) {
        continue;
      }

      formFields.push({
        handle: prop.handle,
        label: prop.label,
      });
    }

    return formFields;
  };

  updateMappings = () => {
    const selectList = this.refs.items.querySelectorAll('select');

    const mapping = {};
    for (let i = 0; i < selectList.length; i++) {
      const select = selectList[i];

      if (!select.value) {
        continue;
      }

      mapping[select.name] = select.value;
    }

    this.props.onChangeHandler('mapping', mapping);
  };
}
