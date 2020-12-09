import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../../../app';
import * as FieldTypes from '../../../../constants/FieldTypes';

const Criteria = (props) => (
  <tr>
    <td width="100">
      <div className="select">
        <select className="rule-criteria-hash small" name="hash" value={props.hash} onChange={props.updateCriteriaHash}>
          <option value={null}>---</option>
          {props.availableFields.map((item, index) => {
            if (item.key === props.parentFieldHash) return;

            return (
              <option value={item.key} key={index}>
                {item.value}
              </option>
            );
          })}
        </select>
      </div>
    </td>
    <td width="46">
      <a onClick={props.toggleCriteriaEquals} className="rule-criteria-equals">
        {translate(props.equals ? 'is' : 'is not')}
      </a>
    </td>
    <td>{getInputByFieldType(props)}</td>
    <td className="action">
      <a onClick={props.removeCriteria} className="delete" title={translate('Remove')} />
    </td>
  </tr>
);

const getInputByFieldType = (props) => {
  const { targetFieldProperties: properties, value, updateCriteriaValue } = props;

  switch (properties.type) {
    case FieldTypes.CHECKBOX:
    case FieldTypes.MAILING_LIST:
      return (
        <input
          className="rule-criteria-value"
          type="checkbox"
          name="value"
          value="1"
          checked={!!value}
          onChange={(event) => {
            event.target.value = event.target.checked ? '1' : '';

            updateCriteriaValue(event);
          }}
        />
      );

    case FieldTypes.CHECKBOX_GROUP:
    case FieldTypes.RADIO_GROUP:
    case FieldTypes.SELECT:
    case FieldTypes.MULTIPLE_SELECT:
      const options = properties.generatedOptions ? properties.generatedOptions : properties.options;

      return (
        <div className="select">
          <select value={value} onChange={updateCriteriaValue}>
            <option value="">Empty</option>
            {options.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      );

    case FieldTypes.DYNAMIC_RECIPIENTS:
      return (
        <div className="select">
          <select value={value} onChange={updateCriteriaValue}>
            <option value="">Empty</option>
            {properties.options.map((item, i) => (
              <option key={item.value} value={i}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return (
        <input className="rule-criteria-value" type="text" name="value" value={value} onChange={updateCriteriaValue} />
      );
  }
};

Criteria.propTypes = {
  parentFieldHash: PropTypes.string,
  hash: PropTypes.string,
  equals: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  targetFieldProperties: PropTypes.object.isRequired,
  removeCriteria: PropTypes.func.isRequired,
  updateCriteriaHash: PropTypes.func.isRequired,
  toggleCriteriaEquals: PropTypes.func.isRequired,
  updateCriteriaValue: PropTypes.func.isRequired,
};

export default Criteria;
