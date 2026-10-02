import { useAutosuggestEnvVariables } from "@ff-client/queries/autosuggest";
import translate from "@ff-client/utils/translations";
import { useMemo } from "react";
import { parseEnvBoolean } from "./bool-env.operations";

export type BooleanOption = {
  label: string;
  value: string;
  data: { boolean: string; indicator: { variant: string }; hint?: string };
};

export type BooleanOptionGroup = {
  type: "optgroup";
  label: string;
  options: BooleanOption[];
};

export const useEnvOptions = (): (BooleanOption | BooleanOptionGroup)[] => {
  const { data } = useAutosuggestEnvVariables();
  return useMemo(() => {
    const enabledLabel = translate("Enabled");
    const disabledLabel = translate("Disabled");
    const option = (
      value: string,
      label: string,
      enabled: boolean,
    ): BooleanOption => ({
      value,
      label,
      data: {
        boolean: enabled ? "1" : "0",
        indicator: { variant: enabled ? "success" : "empty" },
      },
    });
    return [
      option("true", enabledLabel, true),
      option("false", disabledLabel, false),
      ...(data ?? []).map(
        (category): BooleanOptionGroup => ({
          type: "optgroup",
          label: category.label,
          options: category.data.flatMap((item) => {
            const enabled = parseEnvBoolean(item.hint);
            if (enabled === null) return [];
            return [
              {
                ...option(item.name, item.name, enabled),
                data: {
                  boolean: enabled ? "1" : "0",
                  indicator: { variant: enabled ? "success" : "empty" },
                  hint: enabled ? enabledLabel : disabledLabel,
                },
              },
            ];
          }),
        }),
      ),
    ];
  }, [data]);
};
