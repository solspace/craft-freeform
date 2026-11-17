import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { StringProperty } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import type React from "react";
import { useEffect, useRef } from "react";
import { EnvSuggestInput } from "./env-suggest";

const StringInput: React.FC<ControlType<StringProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
  context,
}) => {
  const { handle } = property;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  const isCode = property.flags?.includes("code");
  const isReadonly =
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");
  const isEnvSuggest = property.flags?.includes("env-suggest");

  return (
    <Control property={property} errors={errors} context={context}>
      {isEnvSuggest ? (
        <EnvSuggestInput
          value={value}
          property={property}
          updateValue={updateValue}
          errors={errors}
          autoFocus={autoFocus}
        />
      ) : (
        <input
          id={handle}
          ref={ref}
          type="text"
          autoComplete="off"
          data-1p-ignore
          readOnly={isReadonly}
          className={classes(
            "text",
            "fullwidth",
            isCode && "code",
            isReadonly && "readonly",
          )}
          value={value ?? ""}
          placeholder={property.placeholder}
          onChange={(event) => updateValue(event.target.value)}
        />
      )}
    </Control>
  );
};

export default StringInput;
