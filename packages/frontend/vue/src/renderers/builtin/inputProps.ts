import type { VueFieldRendererProps } from "../../types.js";

export function inputProps(props: VueFieldRendererProps) {
  const raw = props.input as {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (event: Event) => void;
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
