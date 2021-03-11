import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  addFieldRule,
  addGotoRule,
  removeFieldRule,
  removeGotoRule,
  removePageBlock,
  toggleMatchAll,
  toggleShow,
} from '../../../../actions/Rules';
import { SOURCE_CUSTOM } from '../../../../constants/ExternalOptions';
import {
  DYNAMIC_FIELD_TYPES,
  HTML,
  PAGE,
  RULE_CRITERIA_SUPPORTED_TYPES,
  RULE_SUPPORTED_TYPES,
} from '../../../../constants/FieldTypes';
import { FIELD, GOTO } from '../../../../constants/RuleTypes';
import { pageIndex } from '../../../../helpers/PropertyHelper';
import Rule from './Rule';
import RuleBlock from './RuleBlock';
import FieldRuleHeader from './RuleHeaders/FieldRuleHeader';
import GotoRuleHeader from './RuleHeaders/GotoRuleHeader';

@connect(
  (state) => ({
    layout: state.composer.layout,
    properties: state.composer.properties,
    generatedOptions: state.generatedOptionLists.cache,
  }),
  (dispatch) => ({
    removePageBlock: (pageHash) => dispatch(removePageBlock(pageHash)),
    addFieldRule: (pageHash, hash) => dispatch(addFieldRule(pageHash, hash)),
    removeFieldRule: (pageHash, index) => dispatch(removeFieldRule(pageHash, index)),
    addGotoRule: (pageHash, targetPageHash) => dispatch(addGotoRule(pageHash, targetPageHash)),
    removeGotoRule: (pageHash, index) => dispatch(removeGotoRule(pageHash, index)),
    toggleShow: (pageHash, index) => dispatch(toggleShow(pageHash, index)),
    toggleMatchAll: (pageHash, target, index) => dispatch(toggleMatchAll(pageHash, target, index)),
  })
)
export default class PageBlock extends Component {
  static propTypes = {
    properties: PropTypes.object,
    pageHash: PropTypes.string.isRequired,
    page: PropTypes.object.isRequired,
    fieldRules: PropTypes.array,
    gotoRules: PropTypes.array,
    removePageBlock: PropTypes.func,
    addFieldRule: PropTypes.func,
    removeFieldRule: PropTypes.func,
    addGotoRule: PropTypes.func,
    removeGotoRule: PropTypes.func,
    toggleShow: PropTypes.func,
    showHandles: PropTypes.bool,
  };

  getFieldPropsByHash = (hash) => {
    const props = { ...this.props.properties[hash] };
    if (props.source && props.source !== SOURCE_CUSTOM) {
      props.generatedOptions = this.props.generatedOptions[hash];
    }

    return props;
  };

  render() {
    const { properties, layout, page, pageHash, fieldRules, gotoRules } = this.props;
    const { addFieldRule, addGotoRule, removeFieldRule, removeGotoRule, removePageBlock } = this.props;
    const { showHandles = false } = this.props;

    const { toggleShow, toggleMatchAll } = this.props;

    const availableCriteriaFields = getAvailableFields(properties, layout, pageHash, RULE_CRITERIA_SUPPORTED_TYPES, showHandles);
    const availableFields = getAvailableFields(properties, layout, pageHash, RULE_SUPPORTED_TYPES, showHandles);
    const availablePages = getAvailablePages(properties);

    const fieldRuleElements = [];
    const gotoRuleElements = [];
    const usedFieldHashes = [];
    const usedPageHashes = [];

    fieldRules.map((rule, i) => {
      if (!properties[rule.hash]) return;
      usedFieldHashes.push(rule.hash);

      let label = properties[rule.hash].label;
      if (DYNAMIC_FIELD_TYPES.indexOf(properties[rule.hash].type) !== -1) {
        label += ` (${rule.hash})`;
      }

      fieldRuleElements.push(
        <li key={rule.hash}>
          <Rule
            title={label}
            headerRow={
              <FieldRuleHeader
                rule={rule}
                toggleShow={() => toggleShow(pageHash, i)}
                toggleMatchAll={() => toggleMatchAll(pageHash, FIELD, i)}
              />
            }
            target={FIELD}
            pageHash={pageHash}
            index={i}
            availableFields={availableCriteriaFields}
            rule={rule}
            removeRule={removeFieldRule}
            getFieldPropsByHash={this.getFieldPropsByHash}
          />
        </li>
      );
    });

    gotoRules.map((rule, i) => {
      const key = rule.targetPageHash;

      if (!properties[key] && key != -999) return;
      usedPageHashes.push(key);

      const label = key == -999 ? 'Submit' : properties[key].label;

      gotoRuleElements.push(
        <li key={rule.targetPageHash}>
          <Rule
            headerRow={
              <GotoRuleHeader pageLabel={label} rule={rule} toggleMatchAll={() => toggleMatchAll(pageHash, GOTO, i)} />
            }
            target={GOTO}
            pageHash={pageHash}
            index={i}
            availableFields={availableCriteriaFields}
            rule={rule}
            removeRule={removeGotoRule}
            getFieldPropsByHash={this.getFieldPropsByHash}
          />
        </li>
      );
    });

    const unusedFields = getUnusedFields(availableFields, usedFieldHashes);
    const unusedGotoPages = getUnusedGotoPages(availablePages, usedPageHashes);

    return (
      <div>
        <ul className="composer-actions composer-rule-actions">
          <li className="composer-action-remove" onClick={() => removePageBlock(pageHash)} />
        </ul>

        <h4 className="page-block-header">{page.label}</h4>

        <RuleBlock
          title={'Field rules'}
          fields={unusedFields}
          ruleElements={fieldRuleElements}
          addHandler={(event) => addFieldRule(pageHash, event.target.value)}
        />

        <hr style={{ marginTop: 15 }} />

        <RuleBlock
          fields={unusedGotoPages}
          title={'Page rules'}
          ruleElements={gotoRuleElements}
          addHandler={(event) => addGotoRule(pageHash, event.target.value)}
        />
      </div>
    );
  }
}

const getAvailableFields = (properties, layout, pageHash, supportedTypes, showHandles) => {
  const usableFields = [];
  const pageFields = [];

  const index = pageIndex(pageHash);

  if (typeof layout[index] === 'object') {
    for (const rows of layout[index]) {
      for (const hash of rows.columns) {
        pageFields.push(hash);
      }
    }
  }

  for (const [key, item] of Object.entries(properties)) {
    if (supportedTypes.indexOf(item.type) === -1 || pageFields.indexOf(key) === -1) {
      continue;
    }

    let label = item.label;

    if (DYNAMIC_FIELD_TYPES.indexOf(item.type) !== -1) {
      label = `${label} (${key})`;
    } else if (showHandles) {
      const handle = item.handle ?? key;
      label += ` (${handle})`;
    }

    usableFields.push({
      key,
      value: label,
      type: item.type,
    });
  }

  return usableFields;
};

const getUnusedFields = (fields, usedFieldHashes) => {
  const unusedFields = [];

  fields.forEach((field) => {
    if (usedFieldHashes.indexOf(field.key) === -1 && RULE_SUPPORTED_TYPES.indexOf(field.type) !== -1) {
      unusedFields.push(field);
    }
  });

  return unusedFields;
};

const getAvailablePages = (properties) => {
  const pages = [];

  for (const [key, item] of Object.entries(properties)) {
    if (item.type !== PAGE) continue;

    pages.push({
      key,
      value: item.label,
    });
  }

  pages.push({
    key: -999,
    value: 'Submit form',
  });

  return pages;
};

const getUnusedGotoPages = (pages, usedHashes) => pages.filter((page) => usedHashes.indexOf(page.key) === -1);
