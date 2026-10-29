import { useRef } from "react";
import { EditorInput, type EditorInputProps } from "./editor.input";

type Props = Omit<EditorInputProps, "property" | "children">;
const ADVANCED_FILTER = "Boolean(values.showAdvanced)";

export function EditorInputs({ integration, ...props }: Props) {
  const behaviorEdited = useRef(false);
  const isRecaptcha =
    integration.type.class ===
    "Solspace\\Freeform\\Integrations\\Captchas\\ReCaptcha\\ReCaptcha";
  const onUpdate: EditorInputProps["onUpdate"] = (key, value) => {
    if (key === "failureBehavior") behaviorEdited.current = true;
    if (
      isRecaptcha &&
      integration.id == null &&
      key === "version" &&
      !behaviorEdited.current &&
      ["v3", "v2-invisible", "v2-checkbox"].includes(value)
    ) {
      props.onUpdate?.(
        "failureBehavior",
        value === "v3" ? "send-to-spam" : "display-error",
      );
    }
    props.onUpdate?.(key, value);
  };
  const disclosure = isRecaptcha
    ? integration.properties.find(
        (property) => property.handle === "showAdvanced",
      )
    : undefined;
  const advanced = disclosure
    ? integration.properties.filter((property) =>
        property.visibilityFilters?.includes(ADVANCED_FILTER),
      )
    : [];
  const grouped = new Set(advanced.map((property) => property.handle));
  const key = `${integration.type.class}-${integration.id ?? "new"}`;
  return integration.properties
    .filter((property) => !grouped.has(property.handle))
    .map((property) => (
      <EditorInput
        key={`${key}-${property.handle}`}
        integration={integration}
        property={property}
        {...props}
        onUpdate={onUpdate}
      >
        {property === disclosure &&
          advanced.map((setting) => (
            <EditorInput
              key={`${key}-${setting.handle}`}
              integration={integration}
              {...props}
              onUpdate={onUpdate}
              property={{
                ...setting,
                visibilityFilters: setting.visibilityFilters?.filter(
                  (filter) => filter !== ADVANCED_FILTER,
                ),
              }}
            />
          ))}
      </EditorInput>
    ));
}
