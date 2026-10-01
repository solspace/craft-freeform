import { useFieldExtension } from "../../hooks/useFieldExtension.js";
import type { ReactFieldRendererProps } from "../../types.js";

export function StripePaymentFieldRenderer(props: ReactFieldRendererProps) {
  const hostRef = useFieldExtension(props.field, props.form);

  return (
    <div
      ref={hostRef}
      className={props.classNames.input}
      data-freeform-stripe={props.field.handle}
    />
  );
}
