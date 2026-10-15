import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Control } from "@components/form-controls/control";
import StringInput from "@components/form-controls/control-types/string/string";
import type { ErrorCollection } from "@ff-client/types/api";
import {
  type GenericValue,
  type Option,
  type Property,
  PropertyType,
} from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import { type FC, useEffect, useMemo, useRef, useState } from "react";

import type { Integration } from "../integration.types";

import type { IntegrationState } from "./editor.types";

const OTHER = "__freeform_custom_model__";

type Model = { id: string; label: string };
type ModelResponse = { models: Model[]; available: boolean };

type Props = {
  property: Property;
  integration: Integration;
  values: IntegrationState;
  errors?: ErrorCollection;
  onUpdate?: (key: string, value: GenericValue) => void;
};

const recommendModel = (
  provider: string,
  models: Model[],
): string | undefined => {
  if (
    provider === "Gemini" &&
    models.some((model) => model.id === "gemini-flash-lite-latest")
  ) {
    return "gemini-flash-lite-latest";
  }

  const patterns: Record<string, RegExp> = {
    OpenAI: /^gpt-\d+(?:\.\d+)?-(?:luna|nano)$/,
    Gemini: /^gemini-\d+(?:\.\d+)?-flash-lite$/,
    Anthropic: /^claude-haiku-\d+(?:-\d+)?(?:-\d{8})?$/,
  };
  const pattern = patterns[provider];
  if (!pattern) return undefined;

  const candidates = models
    .filter((model) => pattern.test(model.id))
    .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

  if (provider === "Anthropic") {
    const verifiedAliases = candidates.filter((model) =>
      model.label.includes("(alias)"),
    );
    if (verifiedAliases.length) return verifiedAliases[0].id;
  }

  return candidates[0]?.id;
};

export const ModelInput: FC<Props> = ({
  property,
  integration,
  values,
  errors,
  onUpdate,
}) => {
  const provider = integration.type.name;
  const value = String(values.metadata.model ?? property.value ?? "");
  const apiKey = String(
    values.metadata.apiKey ??
      integration.properties.find((item) => item.handle === "apiKey")?.value ??
      "",
  );
  const [result, setResult] = useState<ModelResponse>();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showOther, setShowOther] = useState(false);
  const userSelectedModel = useRef(false);

  useEffect(() => {
    if (!apiKey.trim()) {
      setResult(undefined);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(
      async () => {
        setResult(undefined);
        setLoading(true);
        try {
          const response = await axios.post<ModelResponse>(
            "/api/integrations/models",
            { provider, apiKey },
            { signal: controller.signal },
          );
          if (!controller.signal.aborted) setResult(response.data);
        } catch {
          if (!controller.signal.aborted) {
            setResult({ models: [], available: false });
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      refresh ? 0 : 500,
    );

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [apiKey, provider, refresh]);

  const models = result?.models ?? [];
  const listed = models.some((model) => model.id === value);
  const custom = showOther || (!!value && !listed && result !== undefined);
  const options: Option[] = useMemo(() => {
    const items = models.map((model) => ({
      value: model.id,
      label: model.label,
    }));
    if (value && !listed && !result) {
      items.unshift({ value, label: value });
    }

    return [
      ...items,
      { value: OTHER, label: translate("Other / Custom model ID") },
    ];
  }, [models, value, listed, result]);

  useEffect(() => {
    if (
      integration.id != null ||
      !result?.available ||
      !models.length ||
      userSelectedModel.current ||
      values.metadata.model !== property.value
    ) {
      return;
    }

    const recommended = recommendModel(provider, models);
    if (recommended && recommended !== value) onUpdate?.("model", recommended);
  }, [
    integration.id,
    result,
    models,
    values.metadata.model,
    property.value,
    provider,
    value,
    onUpdate,
  ]);

  return (
    <>
      <Control property={property} errors={errors?.metadata?.model}>
        <div className="flex" style={{ gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Dropdown
              value={custom ? OTHER : value}
              options={options}
              emptyOption={translate("Choose a model")}
              loading={loading}
              onChange={(selected) => {
                userSelectedModel.current = true;
                if (selected === OTHER) {
                  setShowOther(true);
                } else {
                  setShowOther(false);
                  onUpdate?.("model", selected);
                }
              }}
            />
          </div>
          <button
            type="button"
            className={classes("btn", loading && "disabled")}
            disabled={!apiKey.trim() || loading}
            onClick={() => setRefresh((previous) => previous + 1)}
          >
            {translate("Refresh models")}
          </button>
        </div>
        {result && !result.available && (
          <p>
            {translate(
              "Could not load models. You can still enter a custom model ID.",
            )}
          </p>
        )}
        {result?.available && models.length === 0 && (
          <p>
            {translate(
              "No compatible models were returned. You can enter a custom model ID.",
            )}
          </p>
        )}
      </Control>

      {custom && (
        <StringInput
          property={{
            type: PropertyType.String,
            handle: "customModelId",
            label: translate("Custom model ID"),
            instructions: translate(
              "Enter the exact model ID supported by this provider.",
            ),
            placeholder: property.placeholder,
            flags: property.flags,
          }}
          value={value}
          updateValue={(next) => {
            userSelectedModel.current = true;
            onUpdate?.("model", next);
          }}
        />
      )}
    </>
  );
};
