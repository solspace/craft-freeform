import { Control } from "@components/form-controls/control";
import { TextArea } from "@components/form-controls/control-types/textarea/textarea.styles";
import type { ControlType } from "@components/form-controls/types";
import { type Property, PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { useState } from "react";
import styled from "styled-components";
import { appendStarterEntries, starterList } from "./editor.starter-lists";

const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 28px;
    white-space: nowrap;
  }
  svg { display: block; width: 14px; height: 14px; flex: 0 0 14px; }
`;

export function StarterListTextarea({
  property,
  value,
  errors,
  context,
  updateValue,
  autoFocus,
}: ControlType<Property>) {
  const [insertion, setInsertion] = useState<{
    before: string;
    after: string;
  }>();
  const className = (context as { type?: { class?: string } } | undefined)?.type
    ?.class;
  const preset = starterList(className ?? "", property.handle);
  if (!preset || property.type !== PropertyType.Textarea) return null;
  const text =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value.join("\n")
        : "";
  const next = appendStarterEntries(text, preset);
  const disabled =
    property.disabled ||
    property.flags?.some((flag) =>
      ["readonly", "as-readonly-in-instance"].includes(flag),
    );
  const canUndo = insertion && insertion.after === text;
  const description = [
    translate(property.instructions),
    translate(preset.description),
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Control
      property={{ ...property, instructions: description }}
      errors={errors}
      context={context}
      extraContent={
        <Actions>
          <button
            type="button"
            className="btn small"
            disabled={disabled || !next.added}
            title={translate(
              "Adds missing entries without replacing your list.",
            )}
            onClick={() => {
              setInsertion({ before: text, after: next.value });
              updateValue(next.value);
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
            <span>
              {translate(
                next.added ? "Add Starter List" : "Starter List Added",
              )}
            </span>
          </button>
          {canUndo && (
            <button
              type="button"
              className="btn small"
              disabled={disabled}
              onClick={() => {
                updateValue(insertion.before);
                setInsertion(undefined);
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 3 2 6l3 3M2 6h7a4 4 0 0 1 0 8H7" />
              </svg>
              <span>{translate("Undo")}</span>
            </button>
          )}
        </Actions>
      }
    >
      <TextArea
        id={property.handle}
        aria-label={property.label}
        className="text fullwidth"
        rows={property.rows}
        value={text}
        readOnly={disabled}
        placeholder={property.placeholder}
        autoFocus={autoFocus}
        onChange={(event) => {
          setInsertion(undefined);
          updateValue(event.target.value);
        }}
      />
    </Control>
  );
}
