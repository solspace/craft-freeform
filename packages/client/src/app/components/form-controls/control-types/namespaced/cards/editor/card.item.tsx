import { CraftAssetPicker } from "@components/elements/craft-asset-picker/craft-asset-picker";
import { RemoveButton } from "@components/elements/remove-button/remove";
import { Tooltip } from "@components/elements/tooltip/tooltip";
import { ControlBlock } from "@components/form-controls/control.block";
import { useDebounce } from "@ff-client/hooks/use-debounce";
import type { GenericValue } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import { Editor } from "@monaco-editor/react";
import type { FC } from "react";
import { useEffect, useState } from "react";

import type { Card } from "../cards.types";

import {
  ActionButton,
  Actions,
  EditorWrapper,
  Item,
  PillWrapper,
  StatusStrip,
  TextArea,
} from "./card.item.styles";
import CodeIcon from "./code.icon";
import CrossIcon from "./cross.icon";
import GripIcon from "./grip.icon";
import SuccessIcon from "./success.icon";

type Props = {
  card: Card;
  removeCard: () => void;
  updateCard: (card: Card) => void;
};

export const CardItem: FC<Props> = (props) => {
  const [editingMeta, setEditingMeta] = useState(false);

  const { removeCard } = props;
  const entries = countEntries(props.card.metadata);

  return (
    <Item>
      <Actions>
        <ActionButton
          onClick={() => setEditingMeta(!editingMeta)}
          className={classes(editingMeta && "active")}
        >
          <Tooltip
            title={translate("Custom Metadata")}
            delay={[500, 0] as unknown as number}
          >
            <PillWrapper>
              <span className={classes(entries > 0 && "filled")}>
                {entries}
              </span>
              <CodeIcon />
            </PillWrapper>
          </Tooltip>
        </ActionButton>

        <ActionButton className="drag-handle" title={translate("Reorder Card")}>
          <GripIcon />
        </ActionButton>

        <RemoveButton
          active
          onClick={removeCard}
          title={translate("Remove Card")}
        />
      </Actions>

      {editingMeta && <MetadataEditor {...props} />}
      {!editingMeta && <CommonEditor {...props} />}
    </Item>
  );
};

const CommonEditor: FC<Props> = ({ card, updateCard }) => {
  const { label, value, assetId, description } = card;

  return (
    <>
      <ControlBlock label="Image">
        <CraftAssetPicker
          criteria={{ kind: ["image"] }}
          value={assetId ? [assetId] : []}
          limit={1}
          onUpdate={(assetIds) =>
            updateCard({ ...card, assetId: assetIds[0] ?? undefined })
          }
        />
      </ControlBlock>

      <ControlBlock label="Title">
        <input
          type="text"
          className="text fullwidth"
          value={label}
          onChange={(event) =>
            updateCard({ ...card, label: event.target.value })
          }
        />
      </ControlBlock>

      <ControlBlock
        label="Value"
        instructions="Enter a value to use when this card is selected."
      >
        <input
          type="text"
          className="text fullwidth"
          value={value}
          onChange={(event) =>
            updateCard({ ...card, value: event.target.value })
          }
        />
      </ControlBlock>

      <ControlBlock label="Description">
        <TextArea
          rows={4}
          className="text fullwidth"
          value={description}
          onChange={(event) =>
            updateCard({ ...card, description: event.target.value })
          }
        />
      </ControlBlock>
    </>
  );
};

enum Status {
  pending = "pending",
  success = "success",
  error = "error",
}

const MetadataEditor: FC<Props> = ({ card, updateCard }) => {
  const metadataJson = JSON.stringify(card.metadata, null, 2);
  const [status, setStatus] = useState<Status>(Status.pending);
  const [message, setMessage] = useState<string>();
  const [json, setJson] = useState(metadataJson);
  const debouncedJson = useDebounce(json, 1000);

  useEffect(() => {
    setJson((currentJson) =>
      currentJson === metadataJson ? currentJson : metadataJson,
    );
  }, [metadataJson]);

  useEffect(() => {
    if (debouncedJson) {
      setMessage(undefined);
      setStatus(Status.pending);

      try {
        const parsedJson = JSON.parse(debouncedJson);
        const parsedMetadataJson = JSON.stringify(parsedJson, null, 2);
        setStatus(Status.success);

        if (parsedMetadataJson === metadataJson) {
          return;
        }

        updateCard({
          ...card,
          metadata: parsedJson,
        });
      } catch (error) {
        setStatus(Status.error);
        setMessage(error instanceof Error ? error.message : "Invalid JSON");
      }
    }
  }, [debouncedJson, metadataJson, updateCard, card]);

  return (
    <>
      <ControlBlock
        label="Metadata"
        instructions="Enter metadata in JSON format. Access it in your template with `card.metadata.yourProperty`"
      >
        <EditorWrapper>
          <Editor
            height={200}
            value={json}
            defaultLanguage={"json"}
            onChange={(value) => setJson(value)}
            onMount={() => {
              document.body.classList.remove("underline-links");
            }}
            options={{
              folding: false,
              glyphMargin: false,
              renderLineHighlight: "none",
              minimap: { enabled: false },
              lineNumbers: "on",
              lineNumbersMinChars: 1,
              scrollbar: {
                verticalScrollbarSize: 5,
                horizontalScrollbarSize: 5,
              },
            }}
          />
        </EditorWrapper>
      </ControlBlock>

      {status !== Status.pending && (
        <StatusStrip className={status}>
          <span>
            {status === Status.error && <CrossIcon />}
            {status === Status.error && "Invalid JSON"}

            {status === Status.success && <SuccessIcon />}
            {status === Status.success && "JSON Valid"}
          </span>

          {!!message && <div className="code">{message}</div>}
        </StatusStrip>
      )}
    </>
  );
};

const countEntries = (meta: GenericValue): number => {
  if (Array.isArray(meta)) {
    return meta.length;
  }

  if (meta && typeof meta === "object") {
    return Object.keys(meta).length;
  }

  if (typeof meta === "boolean" || typeof meta === "string") {
    return 1;
  }

  return 0;
};
