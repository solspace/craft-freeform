import {
  type EmailSuggestionConfig,
  mountEmailSuggestions,
} from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function EmailFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const element = useRef<HTMLInputElement>(null);
  const controller =
    useRef<ReturnType<typeof mountEmailSuggestions>>(undefined);
  const current = useRef(props);
  current.current = props;

  const configKey = JSON.stringify(props.field.frontend?.config ?? {});

  useEffect(() => {
    const config = JSON.parse(configKey) as EmailSuggestionConfig;

    if (config.suggestEmailCorrections !== true || !element.current) return;

    controller.current = mountEmailSuggestions(
      element.current,
      config.emailSuggestionLabels,
      (value) =>
        current.current.form.setValue(current.current.field.handle, value),
    );

    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, [configKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: External value changes must dismiss stale suggestions.
  useEffect(() => controller.current?.clear(), [input.value]);

  return (
    <input
      type="email"
      className={props.classNames.input}
      {...input}
      ref={element}
    />
  );
}
