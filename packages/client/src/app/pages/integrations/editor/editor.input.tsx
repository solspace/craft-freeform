import { FormComponent } from "@components/form-controls";
import { DisclosureControl } from "@components/form-controls/control-types/disclosure/disclosure";
import { useValueUpdateGenerator } from "@editor/store/hooks/value-update-generator";
import { useResolvedBoolean } from "@ff-client/queries/autosuggest";
import type { ErrorCollection } from "@ff-client/types/api";
import { IntegrationType } from "@ff-client/types/integrations";
import {
  type GenericValue,
  type Property,
  PropertyType,
} from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import type { Integration } from "../integration.types";
import { CaptchaButtons } from "./editor.captcha-buttons";
import { CaptchaChoices } from "./editor.captcha-choices";
import { captchaProvider } from "./editor.captchas";
import { controllingToggle } from "./editor.dependent-settings";
import { hasIntegrationDisclosure } from "./editor.disclosures";
import { DotdigitalChoices } from "./editor.dotdigital-choices";
import { GoogleSheetsChoices } from "./editor.google-sheets-choices";
import { ModelInput } from "./editor.model-input";
import { RecaptchaChoices } from "./editor.recaptcha-choices";
import { RecaptchaScore } from "./editor.recaptcha-score";
import { StarterListTextarea } from "./editor.starter-list-textarea";
import { starterList } from "./editor.starter-lists";
import type { IntegrationState } from "./editor.types";

export type EditorInputProps = {
  property: Property;
  integration: Integration;
  autoFocus?: boolean;
  values?: IntegrationState;
  errors?: ErrorCollection;
  onUpdate?: (key: string, value: GenericValue) => void;
  children?: React.ReactNode;
};

export const EditorInput: React.FC<EditorInputProps> = ({
  property,
  integration,
  autoFocus,
  values,
  errors,
  onUpdate,
  children,
}) => {
  const provider = captchaProvider(integration.type.class);
  const hasDisclosure = hasIntegrationDisclosure(integration.type.class);
  const isDotdigital = [
    "Solspace\\Freeform\\Integrations\\EmailMarketing\\Dotdigital\\Versions\\DotdigitalV2",
    "Solspace\\Freeform\\Integrations\\EmailMarketing\\Dotdigital\\Versions\\DotdigitalV3",
  ].includes(integration.type.class);
  const isRecaptcha =
    integration.type.class ===
    "Solspace\\Freeform\\Integrations\\Captchas\\ReCaptcha\\ReCaptcha";
  const generateUpdateHandler = useValueUpdateGenerator(
    integration.properties,
    {},
    (key, value) => {
      // Require an explicit supported key type when leaving Invisible v2.
      // Silently choosing another type could mismatch the existing Google key.
      if (
        isRecaptcha &&
        key === "verificationMode" &&
        value === "enterprise" &&
        (values.metadata.version ??
          integration.properties.find((item) => item.handle === "version")
            ?.value) === "v2-invisible"
      ) {
        onUpdate?.("version", "");
      }
      onUpdate?.(key, value);
    },
  );

  const handle = property.handle;
  const toggle = controllingToggle(integration.type.class, handle);
  const toggleEnabled = useResolvedBoolean(
    toggle
      ? (values.metadata[toggle] ??
          integration.properties.find((item) => item.handle === toggle)?.value)
      : undefined,
    Boolean(toggle),
  );
  const value = values.metadata[handle] ?? property.value;
  const updatedProperty: Property = {
    ...property,
    flags: (property.flags || [])?.filter(
      (flag) => flag !== "as-readonly-in-instance",
    ),
  };

  if (
    isRecaptcha &&
    handle === "version" &&
    (updatedProperty.type === PropertyType.Select ||
      updatedProperty.type === PropertyType.ButtonGroup)
  ) {
    const mode =
      values.metadata.verificationMode ??
      integration.properties.find((item) => item.handle === "verificationMode")
        ?.value;
    if (mode === "enterprise") {
      updatedProperty.options = updatedProperty.options.filter(
        (option) => !("value" in option) || option.value !== "v2-invisible",
      );
    }
    if (updatedProperty.type === PropertyType.Select) {
      updatedProperty.emptyOption = translate("Select an option");
    }
    updatedProperty.required = true;
  }

  const context = {
    ...integration,
    disclosureStorageKey:
      hasDisclosure && handle === "showAdvanced"
        ? `freeform:integration:${integration.type.class}:${integration.id ?? "new"}:${handle}:expanded`
        : undefined,
    values: {
      name: values.name,
      handle: values.handle,
      enabled: values.enabled,
      ...values.metadata,
    },
  };

  if (
    integration.type.type === IntegrationType.Ai &&
    handle === "model" &&
    ["OpenAI", "Gemini", "Anthropic", "xAI"].includes(integration.type.name)
  ) {
    return (
      <ModelInput
        integration={integration}
        property={updatedProperty}
        values={values}
        errors={errors}
        onUpdate={onUpdate}
      />
    );
  }

  if (toggle && toggleEnabled === false) return null;

  return (
    <FormComponent
      autoFocus={autoFocus}
      value={value}
      property={updatedProperty}
      updateValue={generateUpdateHandler(updatedProperty)}
      errors={errors?.metadata?.[handle]}
      context={context}
      control={
        updatedProperty.type === PropertyType.Textarea &&
        starterList(integration.type.class, handle)
          ? StarterListTextarea
          : integration.type.class ===
                "Solspace\\Freeform\\Integrations\\Other\\Google\\GoogleSheets\\Versions\\GoogleSheetsV4" &&
              handle === "insertOption" &&
              updatedProperty.type === PropertyType.ButtonGroup
            ? GoogleSheetsChoices
            : isDotdigital &&
                updatedProperty.type === PropertyType.ButtonGroup &&
                ["optInType", "emailType"].includes(handle)
              ? DotdigitalChoices
              : hasDisclosure && handle === "showAdvanced"
                ? DisclosureControl
                : isRecaptcha && handle === "scoreThreshold"
                  ? RecaptchaScore
                  : isRecaptcha &&
                      updatedProperty.type === PropertyType.ButtonGroup &&
                      ["verificationMode", "version"].includes(handle)
                    ? RecaptchaChoices
                    : provider &&
                        updatedProperty.type === PropertyType.ButtonGroup &&
                        [
                          "theme",
                          "size",
                          "failureBehavior",
                          "frontendMode",
                          "scriptDomain",
                        ].includes(handle)
                      ? CaptchaButtons
                      : (provider === "hcaptcha" && handle === "version") ||
                          (provider === "friendly-captcha" &&
                            handle === "startMode")
                        ? CaptchaChoices
                        : undefined
      }
    >
      {children}
    </FormComponent>
  );
};
