/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
const wildcardToRegExp = (s) => new RegExp(`^${s.split(/\*+/).map(regExpEscape).join('.*')}$`, 'i');

/**
 * RegExp-escapes all characters in the given string.
 */
const regExpEscape = (s) => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

class RuleSetHandler {
  RULE_TYPE_ANY = 'any';
  RULE_TYPE_ALL = 'all';
  EVENT_APPLY_RULES = 'ff-compile-rules';

  containerMetaData = new WeakMap();

  freeform;
  form;

  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    if (this.form.dataset.hasRules === undefined) {
      return;
    }

    this.reload();
  }

  reload = () => {
    const containers = this.form.querySelectorAll('*[data-ff-rule]');
    containers.forEach((container) => {
      let json = container.dataset.ffRule;
      if (/^'.*'$/.test(json)) {
        json = json.substring(1, json.length - 1);
      }

      const rule = JSON.parse(json);
      const targets = [];

      rule.criteria.forEach((criteria) => {
        const { tgt: target, o: operand, val: value } = criteria;
        let elements;
        let isMultiple = false;

        if (this.form.elements[target]) {
          const tagName = this.form.elements[target].tagName;

          if (tagName) {
            elements = [this.form.elements[target]];
          } else {
            elements = this.form.elements[target];
          }
        } else if (this.form.elements[target + '[]']) {
          elements = this.form.elements[target + '[]'];
          isMultiple = true;
        }

        targets.push({
          isMultiple,
          elements,
          operand,
          value,
        });

        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
          const element = elements[elementIndex];

          let eventType;
          switch (this.getInputType(element)) {
            case 'checkbox':
            case 'radio':
              eventType = 'click';
              break;

            case 'select':
            case 'date':
              eventType = 'change';
              break;

            default:
              eventType = 'keyup';
              break;
          }

          element.addEventListener(eventType, () => container.dispatchEvent(this.createRuleApplicationEvent()));
        }
      });

      this.containerMetaData.set(container, { rule, targets });

      container.addEventListener(this.EVENT_APPLY_RULES, this.applyRules);
      container.dispatchEvent(this.createRuleApplicationEvent());
    });
  };

  /**
   * Applies all of the rules for the target container
   * decides whether to show or hide it based on its rules
   *
   * @param event
   */
  applyRules = (event) => {
    const { target: container } = event;
    const {
      targets,
      rule: { type, show },
    } = this.containerMetaData.get(container);

    let triggersChange = type === this.RULE_TYPE_ALL;

    targets.forEach((target) => {
      const { elements, operand, value } = target;
      const values = [];
      let isCheckboxOrRadio = false;

      for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
        const element = elements[elementIndex];
        const type = element.getAttribute('type');

        if (['checkbox', 'radio'].indexOf(type) !== -1) {
          isCheckboxOrRadio = true;
          if (element.checked) {
            if (type === 'checkbox' && !/\]$/.test(element.name)) {
              values.push('1');
            } else {
              values.push(element.value.toLowerCase());
            }
          }
        } else {
          values.push(element.value.toLowerCase());
        }
      }

      let isMatching;
      if (isCheckboxOrRadio && value === '') {
        isMatching = operand === '=' ? !values.length : !!values.length;
      } else {
        let pattern = wildcardToRegExp(value);
        let valueIsInList = false;
        for (let valIndex = 0; valIndex < values.length; valIndex++) {
          const val = values[valIndex];
          if (pattern.test(val)) {
            valueIsInList = true;
          }
        }

        isMatching = operand === '=' ? valueIsInList : !valueIsInList;
      }

      if (type === this.RULE_TYPE_ANY && isMatching) {
        triggersChange = true;

        return;
      }

      if (type === this.RULE_TYPE_ALL && !isMatching) {
        triggersChange = false;
      }
    });

    container.dataset.hiddenByRules = triggersChange ? !show : show;
    container.style.display = triggersChange ? (show ? 'block' : 'none') : show ? 'none' : 'block';
  };

  /**
   * Gets the input type of an element, e.g.
   * select, textarea, text, checkbox, radio, password, etc.
   *
   * @param element
   * @returns {*}
   */
  getInputType = (element) => {
    const tagName = element.tagName.toLowerCase();

    if (['select', 'textarea'].indexOf(tagName) !== -1) {
      return tagName;
    }

    if (element.classList.contains('form-date-time-field')) {
      return 'date';
    }

    return element.getAttribute('type').toLowerCase();
  };

  createRuleApplicationEvent = () => {
    const event = document.createEvent('Event');
    event.initEvent(this.EVENT_APPLY_RULES, true, true);

    return event;
  };
}

export default RuleSetHandler;
