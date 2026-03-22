import { Checkbox } from "@components/elements/checkbox/checkbox";
import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Control } from "@components/form-controls/control";
import { FlexColumn, FlexRow } from "@components/layout/blocks/flex";
import { spacings } from "@ff-client/styles/variables";
import type { Option, OptionCollection } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import type { TableColumnMetadata } from "../table.types";

import { FileKindOptionsContainer } from "./table.editor.styles";
import type { TableEditorProps } from "./table.editor.types";

const DEFAULTS: Required<TableColumnMetadata> = {
  fileCount: 1,
  maxFileSizeKB: 2048,
  fileKinds: ["image"],
  assetSourceId: null,
  uploadLocation: null,
};

const FALLBACK_FILE_KINDS: Option[] = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "text", label: "Text" },
  { value: "pdf", label: "PDF" },
  { value: "json", label: "JSON" },
];

export const TableFileEditor: React.FC<TableEditorProps> = ({
  column,
  onUpdate,
  property,
}) => {
  const metadata = {
    ...DEFAULTS,
    ...(column.metadata || {}),
  };

  const flattenOptions = (options: OptionCollection = []): Option[] => {
    return options.flatMap((option) => {
      if ("children" in option) {
        return flattenOptions(option.children);
      }

      return option;
    });
  };

  const tableFileKindOptions = flattenOptions(property?.fileKindsOptions);
  const fileKindOptions = tableFileKindOptions.length
    ? tableFileKindOptions
    : FALLBACK_FILE_KINDS;
  const assetSourceOptions = flattenOptions(property?.assetSourceOptions);

  const updateMetadata = (changes: Partial<TableColumnMetadata>): void => {
    onUpdate({
      ...column,
      metadata: {
        ...metadata,
        ...changes,
      },
    });
  };

  const toggleFileKind = (kind: string): void => {
    const selected = new Set(metadata.fileKinds);
    if (selected.has(kind)) {
      selected.delete(kind);
    } else {
      selected.add(kind);
    }

    updateMetadata({ fileKinds: Array.from(selected) });
  };

  return (
    <FlexColumn $gap={spacings.lg}>
      <FlexRow $gap={spacings.md}>
        <Control width={40} label={translate("Max Files")} handle="fileCount">
          <input
            type="number"
            min={1}
            className="text fullwidth"
            value={metadata.fileCount}
            onChange={(event) =>
              updateMetadata({
                fileCount: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
        </Control>

        <Control
          width={60}
          label={translate("Maximum File Size (KB)")}
          handle="maxFileSizeKB"
        >
          <input
            type="number"
            min={1}
            className="text fullwidth"
            value={metadata.maxFileSizeKB}
            onChange={(event) =>
              updateMetadata({
                maxFileSizeKB: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
        </Control>
      </FlexRow>

      <FlexRow>
        <Control
          width={40}
          label={translate("Asset Source")}
          handle="assetSourceId"
          instructions={translate(
            "Select an asset source to be able to store user uploaded files.",
          )}
        >
          <Dropdown
            emptyOption={translate("Select source")}
            value={metadata.assetSourceId ? String(metadata.assetSourceId) : ""}
            options={assetSourceOptions}
            onChange={(value) =>
              updateMetadata({
                assetSourceId: value ? Number(value) : null,
              })
            }
          />
        </Control>

        <Control
          width={60}
          label={translate("Upload Location")}
          handle="uploadLocation"
          instructions={translate(
            "The subfolder path that files should be uploaded to. May contain `{{ form.handle }}` or `{{ form.id }}` variables as well.",
          )}
        >
          <input
            type="text"
            className="text fullwidth"
            value={metadata.uploadLocation || ""}
            onChange={(event) =>
              updateMetadata({ uploadLocation: event.target.value || null })
            }
          />
        </Control>
      </FlexRow>

      <Control label={translate("File Kinds")} handle="fileKinds">
        <FileKindOptionsContainer>
          {fileKindOptions.map((kindOption) => (
            <label key={kindOption.value}>
              <FlexRow $alignItems="center" $gap={spacings.sm}>
                <Checkbox
                  checked={metadata.fileKinds.includes(kindOption.value)}
                  onChange={() => toggleFileKind(kindOption.value)}
                />
                <span>{kindOption.label}</span>
              </FlexRow>
            </label>
          ))}
        </FileKindOptionsContainer>
      </Control>
    </FlexColumn>
  );
};
