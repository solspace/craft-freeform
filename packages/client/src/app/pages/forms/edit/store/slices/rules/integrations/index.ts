import type { Condition, IntegrationRule } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import { Combinator } from '@ff-client/types/rules';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import type { RuleState } from '..';

type IntegrationRulesState = RuleState<IntegrationRule>;

const initialState: IntegrationRulesState = {
  initialized: false,
  items: [],
};

type ModifyCondition = {
  ruleUid: string;
  conditions: Condition[];
};

type ChangePush = {
  ruleUid: string;
  push: boolean;
};

type ChangeCombinator = {
  ruleUid: string;
  combinator: Combinator;
};

export const integrationRulesSlice = createSlice({
  name: 'rules/integrations',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<IntegrationRule[]>) => {
      state.initialized = true;
      state.items = action.payload;
    },
    add: (
      state,
      action: PayloadAction<{ ruleUid: string; integrationUid: string }>
    ) => {
      const { ruleUid, integrationUid } = action.payload;

      state.items.push({
        uid: ruleUid,
        enabled: true,
        push: true,
        combinator: Combinator.Or,
        integration: integrationUid,
        conditions: [
          {
            uid: v4(),
            field: '',
            operator: Operator.Equals,
            value: '',
          },
        ],
      });
    },
    modifyPush: (state, action: PayloadAction<ChangePush>) => {
      const { ruleUid, push } = action.payload;

      const modifyRule = state.items.find((rule) => rule.uid === ruleUid);
      modifyRule.push = push;
    },
    modifyCombinator: (state, action: PayloadAction<ChangeCombinator>) => {
      const { ruleUid, combinator } = action.payload;

      const modifyRule = state.items.find((rule) => rule.uid === ruleUid);
      modifyRule.combinator = combinator;
    },
    modifyConditions: (state, action: PayloadAction<ModifyCondition>) => {
      const { ruleUid, conditions } = action.payload;

      const modifyRule = state.items.find((rule) => rule.uid === ruleUid);
      modifyRule.conditions = conditions;
    },
    remove: (state, action: PayloadAction<string>) => {
      state.items.splice(
        state.items.findIndex((rule) => rule.uid === action.payload),
        1
      );
    },
  },
});

const { actions } = integrationRulesSlice;
export { actions as integrationRuleActions };

export default integrationRulesSlice.reducer;
