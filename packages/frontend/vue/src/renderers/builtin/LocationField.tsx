// @ts-nocheck
import {
  type LocationConfig,
  type LocationController,
  locationComponents,
  locationValue,
  matchLocationOption,
  mountLocation,
} from "@solspace/freeform-core";
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
} from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export const LocationFieldRenderer = defineComponent({
  name: "LocationFieldRenderer",
  props: [
    "field",
    "form",
    "value",
    "errors",
    "input",
    "classNames",
    "renderLabel",
    "renderInstructions",
    "renderErrors",
    "allowRawHtml",
  ],
  setup(props: VueFieldRendererProps) {
    const root = ref<HTMLElement>();
    const element = ref<HTMLInputElement>();
    let controller: LocationController | undefined;
    let previousReset = props.form.resetVersion;
    const setup = () => {
      controller?.destroy();
      if (!element.value || !root.value) return;
      controller = mountLocation(
        element.value,
        (props.field.frontend?.config ?? {}) as LocationConfig,
        {
          root: root.value,
          onChange: (next) => props.form.setValue(props.field.handle, next),
          onMap: (handle, next) => {
            const field = props.form.manifest?.fields[handle];
            if (props.form.isFieldEnabled(handle))
              props.form.setValue(
                handle,
                field?.type === "dropdown"
                  ? matchLocationOption(next, field.options ?? [])
                  : next,
              );
          },
        },
      );
      controller.update(props.value);
    };
    onMounted(setup);
    onUpdated(() => controller?.update(props.value));
    watch(
      () => JSON.stringify(props.field.frontend?.config),
      async () => {
        await nextTick();
        setup();
      },
    );
    watch(
      () => [props.value, props.form.resetVersion],
      () => {
        controller?.update(
          props.value,
          previousReset !== props.form.resetVersion,
        );
        previousReset = props.form.resetVersion;
      },
    );
    onBeforeUnmount(() => controller?.destroy());
    return () => {
      const config = (props.field.frontend?.config ?? {}) as LocationConfig;
      const { value: _value, onChange: _change, ...input } = inputProps(props);
      const value = locationValue(props.value);
      const requiredComponents =
        input.required && config.mode !== "mapped"
          ? (config.requiredComponents ?? []).filter((key) =>
              (config.components ?? locationComponents).includes(key),
            )
          : [];
      const hasErrors = Boolean(input["aria-invalid"] || props.errors?.length);
      const controlClass = (invalid: boolean) =>
        invalid
          ? props.classNames.input
          : props.classNames.input
              ?.split(/\s+/)
              .filter(
                (name) =>
                  !props.classNames.inputError?.split(/\s+/).includes(name),
              )
              .join(" ");
      const showSearch =
        config.showSearch ?? (config.mode === "mapped" || !!config.apiKey);
      const showComponents =
        !showSearch ||
        !config.apiKey ||
        config.addressDisplay === undefined ||
        config.addressDisplay === "always" ||
        (hasErrors && config.addressDisplay !== "search") ||
        (config.addressDisplay === "selected" &&
          locationComponents.some((key) => value[key]?.trim()));
      const searchInvalid =
        showSearch &&
        hasErrors &&
        (!requiredComponents.length || !showComponents);
      return (
        <div ref={root}>
          <input
            {...input}
            ref={element}
            type={showSearch ? "text" : "hidden"}
            required={
              showSearch && input.required && !requiredComponents.length
            }
            aria-invalid={searchInvalid || undefined}
            name={`${props.field.handle}[search]`}
            autocomplete="off"
            class={controlClass(searchInvalid)}
          />
          <div
            class="freeform-location-components"
            data-freeform-location-components=""
            hidden={!showComponents}
            style={{ display: showComponents ? undefined : "none" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,max(220px,calc(50% - 6px))),1fr))",
                gap: "12px",
                marginTop:
                  showSearch &&
                  config.mode !== "mapped" &&
                  (config.components ?? locationComponents).length > 0
                    ? "12px"
                    : "0",
              }}
            >
              {locationComponents.map((key) => {
                const visible =
                  config.mode !== "mapped" &&
                  (config.components ?? locationComponents).includes(key);
                const id = `${input.id ?? props.field.handle}-${key}`;
                const required = visible && requiredComponents.includes(key);
                const invalid =
                  visible &&
                  showComponents &&
                  hasErrors &&
                  (!requiredComponents.length ||
                    (required && !value[key]?.trim()));
                const field = (
                  <input
                    type={visible ? "text" : "hidden"}
                    id={id}
                    name={`${props.field.handle}[${key}]`}
                    class={controlClass(invalid)}
                    data-location-component={key}
                    data-location-required={required ? "" : undefined}
                    required={required && showComponents}
                    aria-invalid={invalid || undefined}
                    aria-describedby={
                      invalid ? input["aria-describedby"] : undefined
                    }
                    disabled={input.disabled}
                  />
                );
                return visible ? (
                  <div key={key} style={{ minWidth: 0 }}>
                    <label
                      class={props.classNames.label}
                      for={id}
                      style={{ display: "block", marginBottom: "4px" }}
                    >
                      {config.labels?.[key] ?? key}
                      {required && (
                        <span
                          aria-hidden="true"
                          class={props.classNames.requiredMark}
                          style={
                            props.classNames.requiredMark
                              ? undefined
                              : {
                                  color:
                                    "var(--ff-location-required-color,#cf1124)",
                                }
                          }
                        >
                          *
                        </span>
                      )}
                    </label>
                    {field}
                  </div>
                ) : (
                  <span key={key} hidden>
                    {field}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );
    };
  },
});
