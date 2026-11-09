import { mountWebsite } from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function WebsiteFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const element = useRef<HTMLInputElement>(null);
  const controller = useRef<ReturnType<typeof mountWebsite>>(undefined);
  const current = useRef(props);
  current.current = props;

  useEffect(() => {
    if (!element.current) return;
    controller.current = mountWebsite(element.current, (value) =>
      current.current.form.setValue(current.current.field.handle, value),
    );
    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: External values and resets must clear stale browser errors.
  useEffect(() => controller.current?.clear(), [input.value]);

  return (
    <input
      type="url"
      className={props.classNames.input}
      {...input}
      ref={element}
    />
  );
}
