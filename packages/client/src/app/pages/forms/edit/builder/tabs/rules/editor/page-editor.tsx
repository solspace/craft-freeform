import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useAppDispatch } from '@editor/store';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import { pageRuleActions } from '@editor/store/slices/rules/pages';
import { pageRuleSelectors } from '@editor/store/slices/rules/pages/page-rules.selectors';
import { useQueryFormRules } from '@ff-client/queries/rules';
import translate from '@ff-client/utils/translations';

import { CombinatorSelect } from '../conditions/combinator/combinator';
import { ConditionTable } from '../conditions/table/condition-table';

import { Remove } from './remove-button/remove';
import { ConfigurationDescription, Label } from './editor.styles';
import { RulesEditorWrapper } from './field-editor.styles';

export const PageRulesEditor: React.FC = () => {
  const { formId, uid } = useParams();
  const { isFetching } = useQueryFormRules(Number(formId || 0));

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const page = useSelector(pageSelecors.one(uid));
  const rule = useSelector(pageRuleSelectors.one(uid));

  if (!page) {
    return null;
  }

  const { label } = page;

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
            onClick={() => dispatch(pageRuleActions.add(uid))}
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
          dispatch(pageRuleActions.remove(uid));
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
          <ConfigurationDescription className="short">
            {translate('Go to this page when')}

            <CombinatorSelect
              value={rule.combinator}
              onChange={(value) =>
                dispatch(
                  pageRuleActions.modifyCombinator({
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
                pageRuleActions.modifyConditions({
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
