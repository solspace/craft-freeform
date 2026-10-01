import {
  getCharacterCount,
  mountTextareaAutoGrow,
} from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { ReactFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

function textareaRows(props: ReactFieldRendererProps): number {
  const rows = props.field.frontend?.config?.rows;
  return typeof rows === "number" && rows > 0 ? rows : 4;
}

function autoGrowMaxHeight(props: ReactFieldRendererProps): number | undefined {
  const max = props.field.frontend?.config?.autoGrowMaxHeight;
  return typeof max === "number" && max > 0 ? max : undefined;
}

export function TextareaFieldRenderer(props: ReactFieldRendererProps) {
  const input = inputProps(props);
  const counter = getCharacterCount(props.field, input.value ?? props.value);
  const autoGrow = props.field.frontend?.config?.autoGrow === true;
  const maxHeight = autoGrowMaxHeight(props);
  const rows = textareaRows(props);
  const ref = useRef<HTMLTextAreaElement>(null);
  const controller =
    useRef<ReturnType<typeof mountTextareaAutoGrow>>(undefined);

  useEffect(() => {
    if (!autoGrow || !ref.current) {
      return;
    }

    controller.current = mountTextareaAutoGrow(ref.current, {
      autoGrowMaxHeight: maxHeight,
    });

    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, [autoGrow, maxHeight]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Controlled value changes (including reset) must resize after React commits to the DOM.
  useEffect(() => controller.current?.update(), [input.value]);

  const textarea = (
    <textarea
      rows={rows}
      className={props.classNames.input}
      {...input}
      ref={ref}
      maxLength={counter?.limit}
      aria-describedby={
        counter
          ? [
              input["aria-describedby"],
              `${input.id ?? props.field.uid}-character-count`,
            ]
              .filter(Boolean)
              .join(" ")
          : input["aria-describedby"]
      }
    />
  );

  if (!counter) {
    return textarea;
  }

  const counterId = `${input.id ?? props.field.uid}-character-count`;

  return (
    <>
      {textarea}
      <div
        id={counterId}
        aria-live="off"
        className={
          counter.overLimit
            ? props.classNames.characterCountError
            : props.classNames.characterCount
        }
        style={{
          marginTop: "0.25rem",
          fontSize: "0.75rem",
          lineHeight: "1.5",
          textAlign: "end",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {counter.text}
      </div>
    </>
  );
}
