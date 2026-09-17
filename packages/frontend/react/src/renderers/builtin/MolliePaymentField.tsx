import { useFieldExtension } from "../../hooks/useFieldExtension.js";
import type { ReactFieldRendererProps } from "../../types.js";

export function MolliePaymentFieldRenderer(props: ReactFieldRendererProps) {
  const hostRef = useFieldExtension(props.field, props.form);

  return (
    <div
      ref={hostRef}
      className={props.classNames.input}
      data-freeform-mollie={props.field.handle}
      hidden
    />
  );
}
