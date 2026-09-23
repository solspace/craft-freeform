// @ts-nocheck
import { getCharacterCount } from "@solspace/freeform-core";
import type { VueFieldRendererProps } from "../../types.js";
import { inputProps } from "./inputProps.js";

export function TextareaFieldRenderer(props: VueFieldRendererProps) {
  const input = inputProps(props);
  const counter = getCharacterCount(props.field, input.value ?? props.value);
  if (!counter)
    return <textarea rows={4} class={props.classNames.input} {...input} />;
  const counterId = `${input.id ?? props.field.uid}-character-count`;
  const descriptions = [input["aria-describedby"], counterId]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <textarea
        rows={4}
        class={props.classNames.input}
        {...input}
        maxLength={counter.limit}
        aria-describedby={descriptions}
        onInput={input.onChange}
      />
      <div
        id={counterId}
        aria-live="off"
        class={
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
