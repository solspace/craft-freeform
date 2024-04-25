import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { useAppDispatch } from '@editor/store';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import { buttonRuleActions } from '@editor/store/slices/rules/buttons';
import { buttonRuleSelectors } from '@editor/store/slices/rules/buttons/buttons.selectors';
import { useQueryFormRules } from '@ff-client/queries/rules';
import type { PageButtonType } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';

import { CombinatorSelect } from '../conditions/combinator/combinator';
import { ConditionTable } from '../conditions/table/condition-table';

import { Remove } from './remove-button/remove';
import { ConfigurationDescription, Label } from './editor.styles';
import { RulesEditorWrapper } from './field.editor.styles';

type Params = {
  formId: string;
  button: PageButtonType;
  uid: string;
};

export const ButtonRulesEditor: React.FC = () => {
  const { formId, button, uid } = useParams<Params>();
  const { isFetching } = useQueryFormRules(Number(formId || 0));

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const page = useSelector(pageSelecors.one(uid));
  const rule = useSelector(buttonRuleSelectors.one(uid, button));

  if (!page) {
    return null;
  }

  const { buttons } = page;
  let label: string;
  switch (button) {
    case 'save':
      label = buttons.saveLabel;
      break;

    case 'submit':
      label = buttons.submitLabel;
      break;

    case 'back':
      label = buttons.backLabel;
      break;

    default:
      label = translate('Button Group');
      break;
  }

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
            onClick={() =>
              dispatch(buttonRuleActions.add({ pageUid: uid, button }))
            }
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
          dispatch(buttonRuleActions.remove(rule.uid));
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
                  buttonRuleActions.modifyCombinator({
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
                buttonRuleActions.modifyConditions({
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
