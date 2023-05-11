import type { Condition, PageRule } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import { Combinator } from '@ff-client/types/rules';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import type { RuleState } from '..';

type PageRulesState = RuleState<PageRule>;

const initialState: PageRulesState = {
  initialized: false,
  items: [],
};

type ModifyCondition = {
  ruleUid: string;
  conditions: Condition[];
};

type ChangeCombinator = {
  ruleUid: string;
  combinator: Combinator;
};

export const pageRulesSlice = createSlice({
  name: 'rules/pages',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<PageRule[]>) => {
      state.initialized = true;
      state.items = action.payload;
    },
    add: (state, action: PayloadAction<string>) => {
      const pageUid = action.payload;

      state.items.push({
        uid: v4(),
        enabled: true,
        page: pageUid,
        combinator: Combinator.Or,
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
      state.items = state.items.filter((rule) => rule.uid !== action.payload);
    },
  },
});

const { actions } = pageRulesSlice;
export { actions as pageRuleActions };

export default pageRulesSlice.reducer;
