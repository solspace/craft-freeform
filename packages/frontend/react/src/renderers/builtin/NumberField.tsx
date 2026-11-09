import {
  mountNumber,
  type NumberConfig,
  numberInputAttributes,
} from "@solspace/freeform-core";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function NumberFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const configKey = JSON.stringify(props.field.frontend?.config ?? {});
  const config = JSON.parse(configKey) as NumberConfig;
  const element = useRef<HTMLInputElement>(null);
  const controller = useRef<ReturnType<typeof mountNumber>>(undefined);
  const [error, setError] = useState("");
  const errorId = useId();
  const serverErrors = JSON.stringify(props.errors ?? []);
  useEffect(() => {
    if (!element.current) return;
    controller.current = mountNumber(
      element.current,
      JSON.parse(configKey),
      setError,
    );
    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, [configKey]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Resets and server responses replace local feedback.
  useEffect(
    () => controller.current?.clear(),
    [input.value, input.disabled, props.form.resetVersion, serverErrors],
  );
  const visibleError = props.errors?.length ? "" : error;
  return (
    <>
      <input
        type="number"
        className={props.classNames.input}
        {...numberInputAttributes(config)}
        {...input}
        ref={element}
        aria-invalid={!!visibleError || input["aria-invalid"]}
        aria-describedby={
          [input["aria-describedby"], visibleError ? errorId : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {visibleError && (
        <div
          id={errorId}
          className={props.classNames.errors}
          role="status"
          aria-live="polite"
        >
          <div className={props.classNames.error}>{visibleError}</div>
        </div>
      )}
    </>
  );
}
