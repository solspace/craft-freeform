import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { CombinatorSelect } from "@editor/builder/tabs/rules/conditions/combinator/combinator";
import { ConditionTable } from "@editor/builder/tabs/rules/conditions/table/condition-table";
import { DisplayTriggerDropdown } from "@editor/builder/tabs/rules/conditions/trigger-dropdown/trigger-dropdown";
import { ConfigurationDescription } from "@editor/builder/tabs/rules/editor/editor.styles";
import { useAppDispatch } from "@editor/store";
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import { integrationRuleActions } from "@editor/store/slices/rules/integrations";
import { integrationRuleSelectors } from "@editor/store/slices/rules/integrations/integration-rules.selectors";
import { useQueryIntegrationRules } from "@ff-client/queries/rules";
import type { Integration } from "@ff-client/types/integrations";
import type { ConditionalRulesProperty } from "@ff-client/types/properties";
import { Combinator } from "@ff-client/types/rules";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { v4 } from "uuid";

const ConditionalIntegrationRules: React.FC<
  ControlType<ConditionalRulesProperty, Integration>
> = ({ property, updateValue, value, context }) => {
  const dispatch = useAppDispatch();
  const generatedValues = useRef<string[]>([]);

  const { id: formId } = useSelector(formSelectors.current);
  const { data, isFetched } = useQueryIntegrationRules(formId);

  const isInitialized = useSelector(integrationRuleSelectors.isInitialized);
  const rule = useSelector(integrationRuleSelectors.one(value));

  const { instanceUid } = context;

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
        integrationRuleActions.add({
          ruleUid,
          integrationUid: instanceUid,
        }),
      );
      updateValue(ruleUid);
    }
  }, [
    isInitialized,
    data,
    isFetched,
    value,
    dispatch,
    instanceUid,
    updateValue,
  ]);

  return (
    <Control property={property}>
      <ConfigurationDescription>
        <DisplayTriggerDropdown
          value={rule?.push ?? true}
          options={{
            on: "Push",
            off: `Don't push`,
          }}
          onChange={(value) =>
            dispatch(
              integrationRuleActions.modifyPush({
                ruleUid: rule.uid,
                push: value,
              }),
            )
          }
        />

        {translate("data to integration when")}

        <CombinatorSelect
          value={rule?.combinator ?? Combinator.Or}
          onChange={(value) =>
            dispatch(
              integrationRuleActions.modifyCombinator({
                ruleUid: rule.uid,
                combinator: value,
              }),
            )
          }
        />

        {translate("of the following rules match:")}
      </ConfigurationDescription>

      <ConditionTable
        loading={!rule}
        conditions={rule ? rule.conditions : []}
        onChange={(conditions) => {
          dispatch(
            integrationRuleActions.modifyConditions({
              ruleUid: rule.uid,
              conditions,
            }),
          );
        }}
      />
    </Control>
  );
};

export default ConditionalIntegrationRules;
