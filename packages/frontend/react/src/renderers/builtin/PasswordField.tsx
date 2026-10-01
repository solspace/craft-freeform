import { useEffect, useId, useRef, useState } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function PasswordFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const generatedId = useId();
  const id = input.id ?? generatedId;
  const ref = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const enabled = props.field.frontend?.config?.showPasswordToggle === true;
  const labels = props.field.frontend?.config?.passwordToggleLabels as
    | { show?: string; hide?: string }
    | undefined;
  useEffect(() => {
    if (!input.value || !enabled) setVisible(false);
  }, [input.value, enabled]);
  useEffect(() => {
    const form = ref.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) setVisible(false);
      });
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, []);
  return (
    <>
      <input
        className={props.classNames.input}
        {...input}
        id={id}
        ref={ref}
        type={enabled && visible ? "text" : "password"}
      />
      {enabled && (
        <button
          type="button"
          className={props.classNames.passwordToggle}
          aria-controls={id}
          disabled={input.disabled}
          onClick={() => setVisible(!visible)}
          style={{
            display: "block",
            margin: ".25rem 0 0 auto",
            padding: "0 .125rem",
            minHeight: "24px",
            border: 0,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            fontSize: ".8125rem",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {visible
            ? (labels?.hide ?? "Hide password")
            : (labels?.show ?? "Show password")}
        </button>
      )}
    </>
  );
}
