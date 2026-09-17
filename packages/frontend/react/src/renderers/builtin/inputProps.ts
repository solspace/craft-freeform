import type { ChangeEvent } from "react";
import type { ReactFieldRendererProps } from "../../types.js";

export function inputProps(props: ReactFieldRendererProps) {
  const raw = props.input as {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string | null;
    "aria-invalid"?: boolean;
  };

  return {
    ...raw,
    placeholder: raw.placeholder ?? undefined,
  };
}
