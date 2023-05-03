import type { Condition, PageRule } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import { Combinator } from '@ff-client/types/rules';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

type PageRulesState = PageRule[];

const initialState: PageRulesState = [];

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
    set: (state, action: PayloadAction<PageRulesState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<string>) => {
      const pageUid = action.payload;

      state.push({
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

      const modifyRule = state.find((rule) => rule.uid === ruleUid);
      modifyRule.combinator = combinator;
    },
    modifyConditions: (state, action: PayloadAction<ModifyCondition>) => {
      const { ruleUid, conditions } = action.payload;

      const modifyRule = state.find((rule) => rule.uid === ruleUid);
      modifyRule.conditions = conditions;
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((rule) => rule.uid !== action.payload);
    },
  },
});

const { actions } = pageRulesSlice;
export { actions as pageRuleActions };

export default pageRulesSlice.reducer;
