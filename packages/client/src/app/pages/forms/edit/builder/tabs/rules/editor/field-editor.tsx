import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@editor/store';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { fieldRuleActions } from '@editor/store/slices/rules/fields';
import { fieldRuleSelectors } from '@editor/store/slices/rules/fields/field-rules.selectors';
import translate from '@ff-client/utils/translations';

import { CombinatorSelect } from '../conditions/combinator/combinator';
import { DisplaySelect } from '../conditions/display/display';
import { ConditionTable } from '../conditions/table/condition-table';

import { ConfigurationDescription, Label } from './editor.styles';
import { RulesEditorWrapper } from './field-editor.styles';

export const FieldRulesEditor: React.FC = () => {
  const { uid } = useParams();
  const dispatch = useAppDispatch();

  const field = useSelector(fieldSelectors.one(uid));
  const rule = useSelector(fieldRuleSelectors.one(uid));

  if (!field) {
    return null;
  }

  const { label } = field.properties;

  if (!rule) {
    return (
      <RulesEditorWrapper>
        <Label>{label}</Label>
        <button
          className="btn add icon dashed"
          onClick={() => dispatch(fieldRuleActions.add(uid))}
        >
          {translate('Add rules')}
        </button>
      </RulesEditorWrapper>
    );
  }

  return (
    <RulesEditorWrapper>
      <Label>{label}</Label>
      <ConfigurationDescription>
        <DisplaySelect
          value={rule.display}
          onChange={(value) =>
            dispatch(
              fieldRuleActions.modifyDisplay({
                ruleUid: rule.uid,
                display: value,
              })
            )
          }
        />

        {translate('this field when')}

        <CombinatorSelect
          value={rule.combinator}
          onChange={(value) =>
            dispatch(
              fieldRuleActions.modifyCombinator({
                ruleUid: rule.uid,
                combinator: value,
              })
            )
          }
        />

        {translate('of the following rules match')}
      </ConfigurationDescription>

      <ConditionTable
        conditions={rule.conditions}
        onChange={(conditions) => {
          dispatch(
            fieldRuleActions.modifyConditions({
              ruleUid: rule.uid,
              conditions,
            })
          );
        }}
      />
    </RulesEditorWrapper>
  );
};
