import {
  type InternationalPhoneConfig,
  mountInternationalPhone,
} from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function PhoneFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const { value, onChange, ...attributes } = input;
  const config = props.field.frontend?.config as
    | InternationalPhoneConfig
    | undefined;
  const enabled = config?.international === true;
  const configKey = JSON.stringify(config);
  const element = useRef<HTMLInputElement>(null);
  const controller =
    useRef<ReturnType<typeof mountInternationalPhone>>(undefined);
  const current = useRef(props);
  current.current = props;
  useEffect(() => {
    if (!enabled || !element.current) return;
    controller.current = mountInternationalPhone(
      element.current,
      JSON.parse(configKey!),
      (next) =>
        current.current.form.setValue(current.current.field.handle, next),
    );
    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, [enabled, configKey]);
  useEffect(() => {
    controller.current?.update(String(value ?? ""));
  }, [value]);
  if (!enabled)
    return <input type="tel" className={props.classNames.input} {...input} />;
  return (
    <input
      type="tel"
      className={props.classNames.input}
      {...attributes}
      ref={element}
      defaultValue={String(value ?? "")}
    />
  );
}
