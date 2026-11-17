import { EnvironmentBadge } from "@components/form-controls/environment-badge";
import type { ControlType } from "@components/form-controls/types";
import { useAutosuggestEnvVariables } from "@ff-client/queries/autosuggest";
import type { StringProperty } from "@ff-client/types/properties";
import { createElement, useEffect, useMemo, useRef } from "react";

export const EnvSuggestInput = ({
  value,
  property,
  updateValue,
  errors,
  autoFocus,
}: ControlType<StringProperty>) => {
  const ref = useRef<HTMLElement & { value?: string }>(null);
  const { data } = useAutosuggestEnvVariables();
  const readOnly =
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");
  const options = useMemo(
    () =>
      (data ?? []).map((category) => ({
        type: "optgroup",
        label: category.label,
        options: category.data.map(({ name, hint }) => ({
          value: name,
          label: name,
          data: { hint },
        })),
      })),
    [data],
  );

  useEffect(() => {
    const combobox = ref.current;
    if (!combobox) return;
    const onInput = (event: Event) => {
      if (
        (event as CustomEvent).detail?.initialize ||
        readOnly ||
        property.disabled
      )
        return;
      const next = combobox.value ?? "";
      if (next !== (value ?? "")) updateValue(next);
    };
    combobox.addEventListener("input", onInput);
    return () => combobox.removeEventListener("input", onInput);
  }, [value, updateValue, readOnly, property.disabled]);

  useEffect(() => {
    if (autoFocus)
      ref.current?.querySelector("input")?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <div className="freeform-env-control freeform-env-control--combobox">
      {createElement("craft-combobox", {
        ref,
        id: property.handle,
        value: value ?? "",
        options,
        requireOptionMatch: false,
        showAllOnEmpty: true,
        readOnly,
        disabled: property.disabled || undefined,
        placeholder: property.placeholder,
        className: property.flags?.includes("code") ? "code" : undefined,
        "aria-label": property.label,
        "aria-invalid": errors?.length ? "true" : undefined,
      })}
      <EnvironmentBadge />
    </div>
  );
};
