import { NativeSlideout } from "@components/slideouts/slideout";
import {
  SlideoutContainer,
  SlideoutFooter,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import translate from "@ff-client/utils/translations";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

import {
  PreviewContainer,
  PreviewEditor,
} from "./previewable-component.styles";
import { PropertyPreview } from "./property-preview";
import { PreviewSurface } from "./property-preview.styles";

const Trigger = styled(PreviewSurface)``;

const FinishButton = styled.button.attrs({
  type: "button",
  className: "btn submit",
})``;

const EditorBody = styled.div<{ $fillEditor: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--l, 18px);

  ${PreviewEditor} {
    flex: 0 0 auto;
    height: ${({ $fillEditor }) => ($fillEditor ? "var(--ff-content-editor-height, 500px)" : "auto")};
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

type Props = {
  title: string;
  preview: ReactNode;
  children: ReactNode;
  fillEditor?: boolean;
  onEdit?: () => void;
  onAfterEdit?: () => void;
  onCancel?: () => void;
};

export const PreviewSlideout: React.FC<Props> = ({
  title,
  preview,
  children,
  fillEditor = true,
  onEdit,
  onAfterEdit,
  onCancel,
}) => {
  const [editing, setEditing] = useState(false);
  const trigger = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);

  useLayoutEffect(() => {
    const element = body.current;
    if (!editing || !fillEditor || !element) return;
    const resize = () => {
      const style = getComputedStyle(element);
      const height =
        element.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom);
      if (height > 0)
        element.style.setProperty("--ff-content-editor-height", `${height}px`);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [editing, fillEditor]);

  const open = () => {
    cancelled.current = false;
    setEditing(true);
    onEdit?.();
  };

  return (
    <>
      <Trigger
        ref={trigger}
        role="button"
        tabIndex={0}
        aria-label={translate("Click to edit data")}
        aria-haspopup="dialog"
        aria-expanded={editing}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
      >
        <PropertyPreview>{preview}</PropertyPreview>
      </Trigger>
      {editing && (
        <NativeSlideout
          title={title}
          onClose={() => {
            setEditing(false);
            if (cancelled.current) onCancel?.();
            else onAfterEdit?.();
            trigger.current?.focus();
          }}
        >
          {(close) => (
            <SlideoutContainer>
              <SlideoutHeader>
                <h1>{title}</h1>
              </SlideoutHeader>
              <EditorBody
                ref={body}
                $fillEditor={fillEditor}
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
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    cancelled.current = true;
                    close();
                  }}
                >
                  {translate("Cancel")}
                </button>
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
