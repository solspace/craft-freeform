import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  addCriteria,
  removeCriteria,
  toggleCriteriaEquals,
  updateCriteriaHash,
  updateCriteriaValue,
} from '../../../../actions/Rules';
import { translate } from '../../../../app';
import Criteria from './Criteria';

@connect(null, (dispatch) => ({
  addCriteria: (pageHash, target, ruleIndex, hash) => dispatch(addCriteria(pageHash, target, ruleIndex, hash)),
  removeCriteria: (pageHash, target, ruleIndex, index) => dispatch(removeCriteria(pageHash, target, ruleIndex, index)),
  updateCriteriaHash: (pageHash, target, ruleIndex, index, hash) =>
    dispatch(updateCriteriaHash(pageHash, target, ruleIndex, index, hash)),
  toggleCriteriaEquals: (pageHash, target, ruleIndex, index) =>
    dispatch(toggleCriteriaEquals(pageHash, target, ruleIndex, index)),
  updateCriteriaValue: (pageHash, target, ruleIndex, index, value) =>
    dispatch(updateCriteriaValue(pageHash, target, ruleIndex, index, value)),
}))
export default class Rule extends Component {
  static propTypes = {
    title: PropTypes.string,
    headerRow: PropTypes.element.isRequired,
    target: PropTypes.string.isRequired,
    pageHash: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    availableFields: PropTypes.array.isRequired,
    rule: PropTypes.object.isRequired,
    removeRule: PropTypes.func.isRequired,
    toggleMatchAll: PropTypes.func,
    addCriteria: PropTypes.func,
    removeCriteria: PropTypes.func,
    updateCriteriaHash: PropTypes.func,
    toggleCriteriaEquals: PropTypes.func,
    updateCriteriaValue: PropTypes.func,
    getFieldPropsByHash: PropTypes.func,
  };

  render() {
    const { title, headerRow, target, availableFields, rule, pageHash, index } = this.props;
    const { removeRule, addCriteria, removeCriteria } = this.props;
    const { updateCriteriaHash, toggleCriteriaEquals, updateCriteriaValue } = this.props;
    const { getFieldPropsByHash } = this.props;

    const { criteria = [] } = rule;

    return (
      <div className="rule-item">
        {!!title && <div className="rule-header">{title}</div>}

        <div className="composer-option-table">
          <table>
            <thead>
              <tr>
                <th colSpan={3}>{headerRow}</th>
                <th className="action" width="22">
                  <a onClick={() => removeRule(pageHash, index)} className="delete" />
                </th>
              </tr>
            </thead>

            <tbody>
              {criteria.map((criteria, i) => (
                <Criteria
                  key={i}
                  parentFieldHash={rule.hash}
                  hash={criteria.hash}
                  value={criteria.value}
                  equals={criteria.equals}
                  targetFieldProperties={getFieldPropsByHash(criteria.hash)}
                  availableFields={availableFields}
                  removeCriteria={() => removeCriteria(pageHash, target, index, i)}
                  updateCriteriaHash={(event) => updateCriteriaHash(pageHash, target, index, i, event.target.value)}
                  toggleCriteriaEquals={() => toggleCriteriaEquals(pageHash, target, index, i)}
                  updateCriteriaValue={(event) => updateCriteriaValue(pageHash, target, index, i, event.target.value)}
                />
              ))}
            </tbody>
          </table>

          <div className="btn add icon option-table-add">
            <div className="select">
              <select onChange={(event) => addCriteria(pageHash, target, index, event.target.value)} value="">
                <option value="">{translate('Add criteria...')}</option>
                {availableFields.map((item) => {
                  if (item.key === rule.hash) return;

                  return (
                    <option value={item.key} key={item.key}>
                      {item.value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
