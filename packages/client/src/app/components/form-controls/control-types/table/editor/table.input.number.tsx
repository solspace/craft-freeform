import { Control } from "@components/form-controls/control";
import { FlexColumn, FlexRow } from "@components/layout/blocks/flex";
import { spacings } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type React from "react";

import type { TableColumnMetadata } from "../table.types";

import type { TableEditorProps } from "./table.editor.types";

type NumberMetadata = Required<
  Pick<
    TableColumnMetadata,
    "minLength" | "maxLength" | "decimalCount" | "step" | "minMaxValues"
  >
>;

const DEFAULTS: NumberMetadata = {
  minLength: null,
  maxLength: null,
  decimalCount: 0,
  step: 1,
  minMaxValues: [null, null],
};

const parseOptionalNumber = (value: string): number | null => {
  if (value === "") {
    return null;
  }

  return Number(value);
};

export const TableNumberEditor: React.FC<TableEditorProps> = ({
  column,
  onUpdate,
}) => {
  const metadata: NumberMetadata = {
    ...DEFAULTS,
    ...(column.metadata || {}),
  };
  const [minValue, maxValue] = metadata.minMaxValues;

  const updateMetadata = (changes: Partial<NumberMetadata>): void => {
    onUpdate({
      ...column,
      metadata: {
        ...metadata,
        ...changes,
      },
    });
  };

  return (
    <FlexColumn $gap={spacings.lg}>
      <FlexRow $gap={spacings.md}>
        <Control width={50} label={translate("Default value")} handle="value">
          <input
            type="number"
            step="any"
            className="text fullwidth"
            value={column.value}
            onChange={(event) =>
              onUpdate({ ...column, value: event.target.value })
            }
          />
        </Control>

        <Control
          width={50}
          label={translate("Placeholder")}
          handle="placeholder"
        >
          <input
            type="text"
            className="text fullwidth"
            value={column.placeholder || ""}
            onChange={(event) =>
              onUpdate({ ...column, placeholder: event.target.value })
            }
          />
        </Control>
      </FlexRow>

      <FlexRow $gap={spacings.md}>
        <Control width={50} label={translate("Min Length")} handle="minLength">
          <input
            type="number"
            min={0}
            className="text fullwidth"
            value={metadata.minLength ?? ""}
            onChange={(event) =>
              updateMetadata({
                minLength: parseOptionalNumber(event.target.value),
              })
            }
          />
        </Control>

        <Control width={50} label={translate("Max Length")} handle="maxLength">
          <input
            type="number"
            min={0}
            className="text fullwidth"
            value={metadata.maxLength ?? ""}
            onChange={(event) =>
              updateMetadata({
                maxLength: parseOptionalNumber(event.target.value),
              })
            }
          />
        </Control>
      </FlexRow>

      <FlexRow $gap={spacings.md}>
        <Control width={50} label={translate("Min")} handle="minValue">
          <input
            type="number"
            step="any"
            className="text fullwidth"
            value={minValue ?? ""}
            onChange={(event) =>
              updateMetadata({
                minMaxValues: [
                  parseOptionalNumber(event.target.value),
                  maxValue,
                ],
              })
            }
          />
        </Control>

        <Control width={50} label={translate("Max")} handle="maxValue">
          <input
            type="number"
            step="any"
            className="text fullwidth"
            value={maxValue ?? ""}
            onChange={(event) =>
              updateMetadata({
                minMaxValues: [
                  minValue,
                  parseOptionalNumber(event.target.value),
                ],
              })
            }
          />
        </Control>
      </FlexRow>

      <FlexRow $gap={spacings.md}>
        <Control
          width={50}
          label={translate("Decimal Count")}
          handle="decimalCount"
        >
          <input
            type="number"
            min={0}
            className="text fullwidth"
            value={metadata.decimalCount ?? ""}
            onChange={(event) =>
              updateMetadata({
                decimalCount: parseOptionalNumber(event.target.value),
              })
            }
          />
        </Control>

        <Control width={50} label={translate("Step")} handle="step">
          <input
            type="number"
            min={0}
            step="any"
            className="text fullwidth"
            value={metadata.step ?? ""}
            onChange={(event) =>
              updateMetadata({ step: parseOptionalNumber(event.target.value) })
            }
          />
        </Control>
      </FlexRow>
    </FlexColumn>
  );
};
