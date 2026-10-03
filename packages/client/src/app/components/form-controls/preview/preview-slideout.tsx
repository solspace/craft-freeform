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

const EditorBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--c-spacing-lg, 24px);

  ${PreviewEditor} {
    min-width: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }

  ${PreviewContainer} {
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
                <button type="button" className="btn" onClick={close}>
                  {translate("Close")}
                </button>
              </SlideoutFooter>
            </SlideoutContainer>
          )}
        </NativeSlideout>
      )}
    </>
  );
};
