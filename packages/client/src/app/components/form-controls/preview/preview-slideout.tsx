import { NativeSlideout } from "@components/slideouts/slideout";
import {
  SlideoutContainer,
  SlideoutFooter,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import translate from "@ff-client/utils/translations";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import styled from "styled-components";

import {
  PreviewContainer,
  PreviewEditor,
} from "./previewable-component.styles";

const Trigger = styled.div`
  cursor: pointer;
  border-radius: var(--c-form-control-radius);
  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }
`;

const FinishButton = styled.button.attrs({
  type: "button",
  className: "btn submit",
})`
  && {
    --primary-button-bg: var(--c-color-accent-fill-loud);
    --primary-button-bg--hover: hsl(from var(--c-color-accent-fill-loud) h s calc(l - 5));
    --primary-button-bg--active: hsl(from var(--c-color-accent-fill-loud) h s calc(l - 10));
    --primary-button-text-color: var(--c-color-accent-on-loud);
    --primary-button-border: 1px solid transparent;
    --primary-button-border--hover: 1px solid transparent;
    --primary-button-border--active: 1px solid transparent;
    background: var(--c-color-accent-fill-loud);
    border: 1px solid transparent;
    color: var(--c-color-accent-on-loud);
  }
  &&:hover {
    background: hsl(from var(--c-color-accent-fill-loud) h s calc(l - 5));
  }
`;

const EditorBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--c-spacing-lg, 24px);

  ${PreviewEditor} {
    flex: 1;
    min-height: 0;
    min-width: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }

  ${PreviewContainer} {
    flex: 1;
    min-height: 0;
    cursor: auto;
    input, select, textarea {
      pointer-events: auto;
    }
  }
`;

type Props = { title: string; preview: ReactNode; children: ReactNode };

export const PreviewSlideout: React.FC<Props> = ({
  title,
  preview,
  children,
}) => {
  const [editing, setEditing] = useState(false);
  const trigger = useRef<HTMLDivElement>(null);

  return (
    <>
      <Trigger
        ref={trigger}
        role="button"
        tabIndex={0}
        aria-label={translate("Click to edit data")}
        aria-haspopup="dialog"
        onClick={() => setEditing(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setEditing(true);
          }
        }}
      >
        {preview}
      </Trigger>
      {editing && (
        <NativeSlideout
          onClose={() => {
            setEditing(false);
            trigger.current?.focus();
          }}
        >
          {(close) => (
            <SlideoutContainer>
              <SlideoutHeader>
                <h1>{title}</h1>
              </SlideoutHeader>
              <EditorBody
                onKeyDown={(event) => {
                  // Keep editor undo/redo from changing the form layout.
                  if (
                    (event.ctrlKey || event.metaKey) &&
                    ["z", "y"].includes(event.key.toLowerCase())
                  ) {
                    event.stopPropagation();
                  }
                }}
              >
                {children}
              </EditorBody>
              <SlideoutFooter>
                <FinishButton onClick={close}>
                  {translate("Finish & Close")}
                </FinishButton>
              </SlideoutFooter>
            </SlideoutContainer>
          )}
        </NativeSlideout>
      )}
    </>
  );
};
