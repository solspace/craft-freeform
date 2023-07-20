import type Freeform from '@components/front-end/plugin/freeform';

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

type Rule = {
  field: string;
  display: 'show' | 'hide';
  combinator: 'and' | 'or';
  conditions: RuleCondition[];
};

type RuleCondition = {
  field: string;
  operator: Operator;
  value: string;
};

class RuleHandler {
  freeform: Freeform;
  form: HTMLFormElement;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.form = freeform.form as HTMLFormElement;

    if (this.form.dataset.hasRules === undefined) {
      return;
    }

    this.reload();
  }

  reload = () => {
    const rulesElement = this.form.querySelector('[data-rules-json]');
    if (!rulesElement) {
      return;
    }

    const rules: Rule[] = JSON.parse(rulesElement.textContent as string);

    // Create a callback which will be called when a field is changed
    const callback =
      (rule: Rule): EventListenerOrEventListenerObject =>
      () => {
        // Trigger the main rule applying for this field
        this.applyRule(rule);

        // Trigger any related rules which are affected by this field
        // this allows for nested rules to work
        rules
          .filter((r) => r.conditions.some((condition) => condition.field === rule.field))
          .forEach((r) => this.applyRule(r));
      };

    // Iterate through all form elements
    Array.from(this.form.elements).forEach((element) => {
      // Find matching rules that are relying on this field
      const matchedRules: Rule[] = rules.filter((rule) =>
        rule.conditions.some((condition) => condition.field === (element as HTMLInputElement).name)
      );

      if (matchedRules.length === 0) {
        return;
      }

      let listener: string;
      switch (element.tagName) {
        case 'TEXTAREA':
        case 'INPUT':
          const input = element as HTMLInputElement;
          if (input.type === 'hidden') {
            return;
          }

          listener = 'keyup';

          break;

        case 'SELECT':
          listener = 'change';
          break;
      }

      if (!listener) {
        return;
      }

      // Attach event listeners
      matchedRules.forEach((rule) => {
        element.addEventListener(listener, callback(rule));
      });
    });

    // Trigger all rules on load
    rules.forEach((rule) => this.applyRule(rule));
  };

  applyRule = (rule: Rule) => {
    const { field, display, combinator, conditions } = rule;

    const fieldContainer = document.querySelector<HTMLDivElement>(`[data-field-container=${field}]`);
    if (!fieldContainer) {
      return;
    }

    // Either all conditions must be true, or at least one must be true
    // based on the combinator value
    const shouldDisplay =
      combinator === 'and' ? conditions.every(this.verifyCondition) : conditions.some(this.verifyCondition);

    // Change the `display` property in the styles based on the the rule's "show"/"hide" setting
    if (display === 'show') {
      fieldContainer.style.display = shouldDisplay ? '' : 'none';
      if (shouldDisplay) {
        delete fieldContainer.dataset.hidden;
      } else {
        fieldContainer.dataset.hidden = '';
      }
    } else {
      fieldContainer.style.display = shouldDisplay ? 'none' : '';
      if (!shouldDisplay) {
        delete fieldContainer.dataset.hidden;
      } else {
        fieldContainer.dataset.hidden = '';
      }
    }
  };

  private verifyCondition = (condition: RuleCondition): boolean => {
    const fieldContainer = document.querySelector<HTMLDivElement>(`[data-field-container=${condition.field}]`);
    if (!fieldContainer) {
      return;
    }

    // Default the value to `null` if the field is hidden, which will help
    // with triggering nested rules

    const isHidden = fieldContainer.dataset.hidden !== undefined;
    const conditionValue = isHidden ? null : this.form[condition.field].value;

    switch (condition.operator) {
      case Operator.Equals:
        return `${conditionValue}`.toLowerCase() === `${condition.value}`.toLowerCase();

      case Operator.NotEquals:
        return `${conditionValue}`.toLowerCase() !== `${condition.value}`.toLowerCase();

      case Operator.GreaterThan:
        return parseFloat(conditionValue) > parseFloat(condition.value);

      case Operator.GreaterThanOrEquals:
        return parseFloat(conditionValue) >= parseFloat(condition.value);

      case Operator.LessThan:
        return parseFloat(conditionValue) < parseFloat(condition.value);

      case Operator.LessThanOrEquals:
        return parseFloat(conditionValue) <= parseFloat(condition.value);

      case Operator.Contains:
        return `${conditionValue}`.toLowerCase().includes(`${condition.value}`.toLowerCase());

      case Operator.NotContains:
        return !`${conditionValue}`.toLowerCase().includes(`${condition.value}`.toLowerCase());

      case Operator.StartsWith:
        return `${conditionValue}`.toLowerCase().startsWith(`${condition.value}`.toLowerCase());

      case Operator.EndsWith:
        return `${conditionValue}`.toLowerCase().endsWith(`${condition.value}`.toLowerCase());

      default:
        return false;
    }
  };
}

export default RuleHandler;
