export const enum Operator {
  Equals = 'equals',
  NotEquals = 'notEquals',
  GreaterThan = 'greaterThan',
  GreaterThanOrEquals = 'greaterThanOrEquals',
  LessThan = 'lessThan',
  LessThanOrEquals = 'lessThanOrEquals',
  Contains = 'contains',
  NotContains = 'notContains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
}

type OperatorTypeKeys = 'boolean' | 'numeric' | 'string' | 'negative';
type OperatorTypes = {
  [key in OperatorTypeKeys]: Operator[];
};

export const operatorTypes: OperatorTypes = {
  boolean: [Operator.Equals, Operator.NotEquals],
  numeric: [
    Operator.GreaterThan,
    Operator.GreaterThanOrEquals,
    Operator.LessThan,
    Operator.LessThanOrEquals,
  ],
  string: [
    Operator.Equals,
    Operator.NotEquals,
    Operator.Contains,
    Operator.NotContains,
    Operator.StartsWith,
    Operator.EndsWith,
  ],
  negative: [Operator.NotEquals, Operator.NotContains],
};

export enum Display {
  Show = 'show',
  Hide = 'hide',
}

export enum Combinator {
  And = 'and',
  Or = 'or',
}

export type Condition = {
  uid: string;
  field: string;
  operator: Operator;
  value: string;
};

export type Rule = {
  uid: string;
  enabled: boolean;
  combinator: Combinator;
  conditions: Condition[];
};

export type FieldRule = Rule & {
  field: string;
  display: Display;
};

export type PageRule = Rule & {
  page: string;
};

export type NotificationRule = Rule & {
  notification: string;
  send: boolean;
};
