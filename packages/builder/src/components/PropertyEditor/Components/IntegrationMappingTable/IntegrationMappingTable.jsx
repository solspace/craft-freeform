import { translate } from '@ff/builder/app';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MappingRow from './MappingRow';

const PATTERN_HANDLE = /^(\w+)___(.*)$/;
const PATTERN_LABEL = /^(.*) \(([\w ]+)\)$/;

const DEFAULT_CATEGORY_HANDLE = 'default';
const DEFAULT_CATEGORY_LABEL = 'Default';

export default class IntegrationMappingTable extends Component {
  static propTypes = {
    formFields: PropTypes.arrayOf(
      PropTypes.shape({
        handle: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
    extraFields: PropTypes.arrayOf(
      PropTypes.shape({
        handle: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        fields: PropTypes.array,
      })
    ),
    fields: PropTypes.array.isRequired,
    mapping: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    name: PropTypes.string,
    mappedAttributeName: PropTypes.string,
  };

  static contextTypes = {
    updateField: PropTypes.func.isRequired,
  };

  getFieldGroups = () => {
    const { fields } = this.props;
    const fieldGroups = {};

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (!field) {
        continue;
      }

      const { handle, label, required, placeholder = null } = field;

      if (PATTERN_HANDLE.test(handle) && PATTERN_LABEL.test(label)) {
        let categoryHandle = handle.replace(PATTERN_HANDLE, '$1');
        let categoryLabel = label.replace(PATTERN_LABEL, '$2');
        const fieldLabel = label.replace(PATTERN_LABEL, '$1');

        if (!categoryHandle) {
          categoryHandle = 'default';
          categoryLabel = 'Object';
        }

        if (!fieldGroups[categoryHandle]) {
          fieldGroups[categoryHandle] = {
            handle: categoryHandle,
            label: categoryLabel,
            fields: [],
          };
        }

        fieldGroups[categoryHandle].fields.push({
          label: fieldLabel,
          handle,
          required,
          placeholder,
        });
      } else {
        if (!fieldGroups[DEFAULT_CATEGORY_HANDLE]) {
          fieldGroups[DEFAULT_CATEGORY_HANDLE] = {
            handle: DEFAULT_CATEGORY_HANDLE,
            label: DEFAULT_CATEGORY_LABEL,
            fields: [],
          };
        }

        fieldGroups[DEFAULT_CATEGORY_HANDLE].fields.push({
          handle,
          label,
          required,
          placeholder,
        });
      }
    }

    return fieldGroups;
  };

  getExtraOptionGroups = () => {
    const { extraFields } = this.props;

    if (!extraFields) {
      return [];
    }

    const optionGroups = [];
    extraFields.forEach((group) => {
      const options = [];
      group.fields.forEach((field) => {
        const key = `${group.handle}###${field.key}`;

        options.push(
          <option key={field.key} value={key}>
            {field.value}
          </option>
        );
      });

      optionGroups.push(
        <optgroup key={group.handle} label={group.label}>
          {options}
        </optgroup>
      );
    });

    return optionGroups;
  };

  render() {
    const fieldGroups = this.getFieldGroups();

    const groupCount = Object.keys(fieldGroups).length;
    const tables = [];

    for (const key in fieldGroups) {
      if (!fieldGroups.hasOwnProperty(key)) {
        continue;
      }
      tables.push(this.renderTable(fieldGroups[key], groupCount > 1));
    }

    return <div ref="items">{tables}</div>;
  }

  renderTable = ({ handle, label, fields }, showLabel = true) => {
    const { mappedAttributeName = 'Field' } = this.props;

    return (
      <div className="composer-option-table field" key={handle} style={{ marginBottom: 10 }}>
        {showLabel && (
          <div className="composer-property-heading heading">
            <label>{label}</label>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>{translate(mappedAttributeName)}</th>
              <th>{translate('FF Field')}</th>
            </tr>
          </thead>

          <tbody>{this.renderRows(fields)}</tbody>
        </table>
      </div>
    );
  };

  /**
   * Render each ROW element
   *
   * @returns {Array}
   */
  renderRows = (fields = []) => {
    const { mapping, formFields } = this.props;

    const children = [];
    fields.map((field, i) => {
      children.push(
        <MappingRow
          key={i}
          handle={field.handle}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          formFields={formFields}
          extraOptions={this.getExtraOptionGroups()}
          mappedFormField={mapping && mapping[field.handle] ? mapping[field.handle] : ''}
          onChangeHandler={this.updateMappings}
        />
      );
    });

    return children;
  };

  updateMappings = () => {
    const { updateField } = this.context;
    const selectList = this.refs.items.querySelectorAll('select');
    const { name } = this.props;
    const fieldName = name || 'mapping';

    const mapping = {};
    for (let i = 0; i < selectList.length; i++) {
      const select = selectList[i];

      if (!select.value) {
        continue;
      }

      mapping[select.name] = select.value;
    }

    updateField({ [fieldName]: mapping });
  };
}
