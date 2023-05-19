import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { CombinatorSelect } from '@editor/builder/tabs/rules/conditions/combinator/combinator';
import { DisplaySend } from '@editor/builder/tabs/rules/conditions/send/send';
import { ConditionTable } from '@editor/builder/tabs/rules/conditions/table/condition-table';
import { ConfigurationDescription } from '@editor/builder/tabs/rules/editor/editor.styles';
import { useAppDispatch } from '@editor/store';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { notificationRuleActions } from '@editor/store/slices/rules/notifications';
import { notificationRuleSelectors } from '@editor/store/slices/rules/notifications/notification-rules.selectors';
import { useQueryNotificationRules } from '@ff-client/queries/rules';
import type { Notification } from '@ff-client/types/notifications';
import type { ConditionalRulesProperty } from '@ff-client/types/properties';
import { Combinator } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';
import { v4 } from 'uuid';

const ConditionalNotificationRules: React.FC<
  ControlType<ConditionalRulesProperty, Notification>
> = ({ property, updateValue, value, context, errors }) => {
  const dispatch = useAppDispatch();
  const generatedValues = useRef<string[]>([]);

  const { id: formId } = useSelector(formSelectors.current);
  const { data, isFetched } = useQueryNotificationRules(formId);

  const isInitialized = useSelector(notificationRuleSelectors.isInitialized);
  const rule = useSelector(notificationRuleSelectors.one(value));

  const { uid: notificationUid } = context;

  useEffect(() => {
    if (generatedValues.current.includes(value)) {
      return;
    }

    if (isFetched && isInitialized) {
      if (value && data.find((rule) => rule.uid === value)) {
        return;
      }

      const ruleUid = v4();
      generatedValues.current.push(ruleUid);

      dispatch(
        notificationRuleActions.add({
          ruleUid,
          notificationUid,
        })
      );
      updateValue(ruleUid);
    }
  }, [isInitialized, rule, data, isFetched, value, generatedValues.current]);

  return (
    <Control property={property}>
      <ConfigurationDescription>
        <DisplaySend
          value={rule?.send ?? true}
          onChange={(value) =>
            dispatch(
              notificationRuleActions.modifySend({
                ruleUid: rule.uid,
                send: value,
              })
            )
          }
        />

        {translate('a notification when')}

        <CombinatorSelect
          value={rule?.combinator ?? Combinator.Or}
          onChange={(value) =>
            dispatch(
              notificationRuleActions.modifyCombinator({
                ruleUid: rule.uid,
                combinator: value,
              })
            )
          }
        />

        {translate('of the following rules match')}
      </ConfigurationDescription>

      <ConditionTable
        loading={!rule}
        conditions={rule ? rule.conditions : []}
        onChange={(conditions) => {
          dispatch(
            notificationRuleActions.modifyConditions({
              ruleUid: rule.uid,
              conditions,
            })
          );
        }}
      />
    </Control>
  );
};

export default ConditionalNotificationRules;
