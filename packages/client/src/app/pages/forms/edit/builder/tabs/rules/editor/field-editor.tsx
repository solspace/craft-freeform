import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useAppDispatch } from '@editor/store';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { fieldRuleActions } from '@editor/store/slices/rules/fields';
import { fieldRuleSelectors } from '@editor/store/slices/rules/fields/field-rules.selectors';
import { useQueryFormRules } from '@ff-client/queries/rules';
import translate from '@ff-client/utils/translations';

import { CombinatorSelect } from '../conditions/combinator/combinator';
import { DisplaySelect } from '../conditions/display/display';
import { ConditionTable } from '../conditions/table/condition-table';

import { Remove } from './remove-button/remove';
import { ConfigurationDescription, Label } from './editor.styles';
import { RulesEditorWrapper } from './field-editor.styles';

export const FieldRulesEditor: React.FC = () => {
  const { formId, uid } = useParams();
  const { isFetching } = useQueryFormRules(Number(formId || 0));

  const navigate = useNavigate();
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
        <Label>
          <LoadingText
            loadingText={translate('Loading data')}
            loading={isFetching}
          >
            {label}
          </LoadingText>
        </Label>
        {!isFetching && (
          <button
            className="btn add icon dashed"
            onClick={() => dispatch(fieldRuleActions.add(uid))}
          >
            {translate('Add rules')}
          </button>
        )}
      </RulesEditorWrapper>
    );
  }

  return (
    <RulesEditorWrapper>
      <Remove
        onClick={() => {
          dispatch(fieldRuleActions.remove(rule.uid));
          navigate('..');
        }}
      />

      <Label>
        <LoadingText
          loadingText={translate('Loading data')}
          loading={isFetching}
        >
          {label}
        </LoadingText>
      </Label>
      {!isFetching && (
        <>
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

            {translate('of the following rules match:')}
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
        </>
      )}
    </RulesEditorWrapper>
  );
};
