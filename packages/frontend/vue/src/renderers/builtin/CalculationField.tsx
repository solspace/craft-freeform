import {
  evaluateCalculation,
  getCalculationConfig,
} from "@solspace/freeform-core";
import { defineComponent, shallowRef, watch } from "vue";
import type { VueFieldRendererProps } from "../../types.js";

export const CalculationFieldRenderer = defineComponent({
  name: "CalculationFieldRenderer",
  props: {
    field: { type: Object, required: true },
    form: { type: Object, required: true },
    classNames: { type: Object, required: true },
    value: { required: true },
  },
  setup(props: VueFieldRendererProps) {
    const config = getCalculationConfig(props.field.frontend?.config);
    const inputType = config.inputType ?? "regularTextInput";
    const setValueRef = shallowRef(props.form.setValue);
    setValueRef.value = props.form.setValue;

    watch(
      () => [
        props.field.handle,
        config.calculations,
        config.decimalCount,
        props.form.values,
      ],
      () => {
        let cancelled = false;
        const formula = config.calculations ?? "";

        void (async () => {
          const result = await evaluateCalculation(
            formula,
            props.form.values,
            config.decimalCount,
          );

          if (cancelled) {
            return;
          }

          const next = result == null ? "" : String(result);
          const current = props.form.getValue(props.field.handle);
          if (String(current ?? "") !== next) {
            setValueRef.value(props.field.handle, next);
          }
        })();

        return () => {
          cancelled = true;
        };
      },
      { immediate: true, deep: true },
    );

    return () => {
      const display =
        props.value == null || props.value === "" ? "" : String(props.value);

      if (inputType === "hidden") {
        return (
          <input
            type="hidden"
            name={props.field.handle}
            value={display}
            readonly
          />
        );
      }

      if (inputType === "plainText") {
        return (
          <div class={props.classNames.input}>
            <input
              type="hidden"
              name={props.field.handle}
              value={display}
              readonly
            />
            <p class="ff-field__calculation-plain" data-freeform-calculation="">
              {display}
            </p>
          </div>
        );
      }

      return (
        <input
          class={props.classNames.input}
          type="text"
          name={props.field.handle}
          id={`freeform-${props.field.handle}`}
          value={display}
          readonly
          aria-readonly="true"
        />
      );
    };
  },
});
