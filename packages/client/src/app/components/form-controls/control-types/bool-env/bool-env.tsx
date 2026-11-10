import { useRenderContext } from "@components/form-controls/context/render.context";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { useCodeblockText } from "@ff-client/hooks/use-codeblock-text";
import { useAutosuggestEnvVariables } from "@ff-client/queries/autosuggest";
import type { BooleanEnvProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { createElement, type ReactNode, useEffect, useRef } from "react";
import styled from "styled-components";
import { useEnvOptions } from "./bool-env.options";
import { EnvLine } from "./env.line";

const translationString =
  "This can be set to an environment variable with a boolean value (`yes`/`no`/`true`/`false`/`on`/`off`/`0`/`1`).";

const MenuWidth = styled.div<{ $compact: boolean }>`
  width: 100%;
  min-width: min(100%, 280px);
  max-width: 100%;
  @media (max-width: 900px) { width: 100%; }
`;

const BoolEnv = ({
  value,
  updateValue,
  property,
  errors,
  context,
}: ControlType<BooleanEnvProperty>): ReactNode => {
  const translated = translate(translationString);
  const codeblock = useCodeblockText(translated);
  const { size } = useRenderContext();

  const { data, isFetching } = useAutosuggestEnvVariables();
  const options = useEnvOptions();
  const comboboxRef = useRef<HTMLElement & { modelValue?: string }>(null);

  useEffect(() => {
    const combobox = comboboxRef.current;
    if (!combobox) return;
    let active = true;
    const onChange = (event: Event): void => {
      if ((event as CustomEvent).detail?.initialize) return;
      queueMicrotask(() => {
        const nextValue = combobox.modelValue;
        if (active && nextValue && nextValue !== value) updateValue(nextValue);
      });
    };
    combobox.addEventListener("model-value-changed", onChange);
    return () => {
      active = false;
      combobox.removeEventListener("model-value-changed", onChange);
    };
  }, [updateValue, value]);

  if (["", "0", "no", "off"].includes(String(value).toLowerCase())) {
    value = "false";
  } else if (["1", "yes", "on"].includes(String(value).toLowerCase())) {
    value = "true";
  }

  const selected = options
    .flatMap((option) => ("options" in option ? option.options : [option]))
    .find((option) => option.value === value);

  return (
    <Control property={property} errors={errors} context={context}>
      <MenuWidth $compact={size === "small"} className="freeform-boolean-menu">
        {createElement("craft-combobox", {
          ref: comboboxRef,
          "model-value": value,
          options: JSON.stringify(options),
          requireoptionmatch: true,
          disabled: property.disabled || (isFetching && !data) || undefined,
          "aria-label": property.label,
          "aria-invalid": errors?.length ? "true" : undefined,
        })}
        <span className="freeform-boolean-menu-status" aria-hidden="true">
          {createElement("craft-indicator", {
            variant: selected?.data.indicator.variant ?? "empty",
          })}
        </span>
      </MenuWidth>
      <EnvLine>{codeblock}</EnvLine>
    </Control>
  );
};

export default BoolEnv;
