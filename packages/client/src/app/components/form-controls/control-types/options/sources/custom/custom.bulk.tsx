import { Control } from "@components/form-controls/control";
import Textarea from "@components/form-controls/control-types/textarea/textarea";
import {
  CancelButton,
  ContinueButton,
} from "@components/modals/confirmation/confirmation.styles";
import {
  SlideoutContainer,
  SlideoutFooter,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import { PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useRef, useState } from "react";

import {
  BulkEditorWrapper,
  BulkSelect,
  BulkSettings,
} from "./custom.bulk.styles";

type Props = {
  open: boolean;
  close: () => void;
  bulkImport: (values: string, separator: string, append: boolean) => void;
};

export const Bulk: React.FC<Props> = ({ open, close, bulkImport }) => {
  const [separator, setSeparator] = useState("|");
  const [append, setAppend] = useState(true);
  const [bulk, setBulk] = useState("");

  const textarea = useRef<HTMLTextAreaElement>(null);

  const executeBulkImport = (): void => {
    bulkImport(bulk, separator, append);
    setBulk("");
    close();
  };

  useOnKeypress(
    {
      callback: (event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          event.stopPropagation();
          executeBulkImport();
        }
      },
      meetsCondition: open,
      type: "keydown",
      ref: textarea,
    },
    [bulk, separator, append],
  );

  return (
    <SlideoutContainer
      className="bulk-editor"
      onKeyDown={(event) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          ["z", "y"].includes(event.key.toLowerCase())
        ) {
          event.stopPropagation();
        }
      }}
    >
      <SlideoutHeader>
        <h1>{translate("Bulk Editor")}</h1>
      </SlideoutHeader>
      <BulkEditorWrapper>
        <BulkSettings>
          <Control label={translate("Separator")} handle="bulk-separator">
            <BulkSelect
              id="bulk-separator"
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            >
              {["|", ",", ";", "=>", " "].map((value) => (
                <option key={value} value={value}>
                  {value === " " ? translate("Space") : value}
                </option>
              ))}
            </BulkSelect>
          </Control>
          <Control label={translate("Import Mode")} handle="bulk-import-mode">
            <BulkSelect
              id="bulk-import-mode"
              value={append ? "append" : "replace"}
              onChange={(event) => setAppend(event.target.value === "append")}
            >
              <option value="append">
                {translate("Append to Existing Values")}
              </option>
              <option value="replace">
                {translate("Replace Existing Values")}
              </option>
            </BulkSelect>
          </Control>
        </BulkSettings>

        <Textarea
          value={bulk}
          updateValue={(value) => setBulk(value)}
          focus={open}
          ref={textarea}
          property={{
            label: translate("Bulk Editor"),
            instructions: translate(
              "Enter bulk values separated by new lines. If using custom values for option labels, you can provide a label and a value separated by a separator. For example, if you used `{separator}` you would write: `Label{separator}value`.",
              { separator },
            ),
            handle: "bulkEditor",
            type: PropertyType.Textarea,
            rows: 10,
          }}
        />
      </BulkEditorWrapper>
      <SlideoutFooter>
        <CancelButton onClick={close}>{translate("Cancel")}</CancelButton>
        <ContinueButton onClick={executeBulkImport}>
          {translate(
            append
              ? "Append Options with Bulk Import"
              : "Replace Options with Bulk Import",
          )}
        </ContinueButton>
      </SlideoutFooter>
    </SlideoutContainer>
  );
};
