import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../../../app';

const RuleBlock = ({ title, fields, ruleElements, addHandler }) => (
  <div className="rule-block">
    <h5 className="craft-header rule-block-header">
      <div>{translate(title)}</div>

      {!!fields.length && (
        <div className="select add-new-rule">
          <select onChange={addHandler} value="">
            <option value="">{translate('Add...')}</option>
            {fields.map(({ key, value }) => (
              <option value={key} key={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      )}
    </h5>

    <ul>{ruleElements}</ul>
  </div>
);

RuleBlock.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  ruleElements: PropTypes.array.isRequired,
  addHandler: PropTypes.func.isRequired,
};

export default RuleBlock;
