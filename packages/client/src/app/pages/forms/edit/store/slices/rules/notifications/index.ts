import type { Condition, NotificationRule } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import { Combinator } from '@ff-client/types/rules';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import type { RuleState } from '..';

type NotificationRulesState = RuleState<NotificationRule>;

const initialState: NotificationRulesState = {
  initialized: false,
  items: [],
};

type ModifyCondition = {
  ruleUid: string;
  conditions: Condition[];
};

type ChangeSend = {
  ruleUid: string;
  send: boolean;
};

type ChangeCombinator = {
  ruleUid: string;
  combinator: Combinator;
};

export const notificationRulesSlice = createSlice({
  name: 'rules/notifications',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<NotificationRule[]>) => {
      state.initialized = true;
      state.items = action.payload;
    },
    add: (
      state,
      action: PayloadAction<{ ruleUid: string; notificationUid: string }>
    ) => {
      const { ruleUid, notificationUid } = action.payload;

      state.items.push({
        uid: ruleUid,
        enabled: true,
        send: true,
        combinator: Combinator.Or,
        notification: notificationUid,
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
    modifySend: (state, action: PayloadAction<ChangeSend>) => {
      const { ruleUid, send } = action.payload;

      const modifyRule = state.items.find((rule) => rule.uid === ruleUid);
      modifyRule.send = send;
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

const { actions } = notificationRulesSlice;
export { actions as notificationRuleActions };

export default notificationRulesSlice.reducer;
