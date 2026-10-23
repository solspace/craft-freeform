import {
  type LocationConfig,
  type LocationController,
  locationComponents,
  locationValue,
  matchLocationOption,
  mountLocation,
} from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function LocationFieldRenderer(props: ReactFieldRendererProps) {
  const config = (props.field.frontend?.config ?? {}) as LocationConfig;
  const configKey = JSON.stringify(config);
  const showSearch =
    config.showSearch ?? (config.mode === "mapped" || !!config.apiKey);
  const root = useRef<HTMLDivElement>(null);
  const element = useRef<HTMLInputElement>(null);
  const controller = useRef<LocationController>(undefined);
  const latest = useRef(props);
  latest.current = props;
  const resetVersion = props.form.resetVersion;
  const previousReset = useRef(resetVersion);
  const value = locationValue(props.value);
  const { value: _value, onChange: _change, ...input } = inputProps(props);
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
            (name) => !props.classNames.inputError?.split(/\s+/).includes(name),
          )
          .join(" ");
  const showComponents =
    !showSearch ||
    !config.apiKey ||
    config.addressDisplay === undefined ||
    config.addressDisplay === "always" ||
    (hasErrors && config.addressDisplay !== "search") ||
    (config.addressDisplay === "selected" &&
      locationComponents.some((key) => value[key]?.trim()));
  const searchInvalid =
    showSearch && hasErrors && (!requiredComponents.length || !showComponents);
  useEffect(() => {
    if (!element.current || !root.current) return;
    controller.current = mountLocation(element.current, JSON.parse(configKey), {
      root: root.current,
      onChange: (next) =>
        latest.current.form.setValue(latest.current.field.handle, next),
      onMap: (handle, next) => {
        const { form } = latest.current;
        const field = form.manifest?.fields[handle];
        if (form.isFieldEnabled(handle))
          form.setValue(
            handle,
            field?.type === "dropdown"
              ? matchLocationOption(next, field.options ?? [])
              : next,
          );
      },
    });
    controller.current.update(latest.current.value);
    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, [configKey]);
  useEffect(() => {
    controller.current?.update(
      props.value,
      previousReset.current !== resetVersion,
    );
    previousReset.current = resetVersion;
  }, [props.value, resetVersion]);
  return (
    <div ref={root}>
      <input
        {...input}
        ref={element}
        type={showSearch ? "text" : "hidden"}
        required={showSearch && input.required && !requiredComponents.length}
        aria-invalid={searchInvalid || undefined}
        name={`${props.field.handle}[search]`}
        autoComplete="off"
        className={controlClass(searchInvalid)}
        defaultValue={showSearch ? (value.search ?? "") : ""}
      />
      <div
        className="freeform-location-components"
        data-freeform-location-components=""
        hidden={!showComponents}
        style={{ display: showComponents ? undefined : "none" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(min(100%,max(220px,calc(50% - 6px))),1fr))",
            gap: 12,
            marginTop:
              showSearch &&
              config.mode !== "mapped" &&
              (config.components ?? locationComponents).length > 0
                ? 12
                : 0,
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
              (!requiredComponents.length || (required && !value[key]?.trim()));
            const field = (
              <input
                key={key}
                type={visible ? "text" : "hidden"}
                id={id}
                name={`${props.field.handle}[${key}]`}
                className={controlClass(invalid)}
                data-location-component={key}
                data-location-required={required ? "" : undefined}
                required={required && showComponents}
                aria-invalid={invalid || undefined}
                aria-describedby={
                  invalid ? input["aria-describedby"] : undefined
                }
                defaultValue={value[key] ?? ""}
                disabled={input.disabled}
              />
            );
            return visible ? (
              <div key={key} style={{ minWidth: 0 }}>
                <label
                  className={props.classNames.label}
                  htmlFor={id}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  {config.labels?.[key] ?? key}
                  {required && (
                    <span
                      aria-hidden="true"
                      className={props.classNames.requiredMark}
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
}
