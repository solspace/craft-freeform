import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import DOMPurify from "dompurify";
import { useState } from "react";
import styled from "styled-components";
import type { WizardOptions } from "./wizard.types";

const Picker = styled.div`
  z-index: 1100; box-sizing: border-box; width: 270px; max-width: calc(100vw - 32px); padding: 12px; background: #fff; border: 1px solid #c8d7e6; border-radius: 6px; box-shadow: 0 6px 24px #304e6b30; color: #3f4d5a;
  p { margin: 0 0 8px; font-size: 12px; font-weight: 600; }
  > div { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  button { display: flex; align-items: center; gap: 7px; padding: 8px; border: 0; border-radius: 4px; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
  button:hover, button:focus-visible { background: #e8f1fb; color: #285f94; outline: 2px solid #5298da; outline-offset: -2px; }
  button span { display: flex; flex: none; width: 16px; height: 16px; color: #5a7d9e; }
  svg { width: 16px; height: 16px; }
`;

export function WizardFieldInsert({
  label,
  choices,
  types,
  onInsert,
}: {
  label: string;
  choices: WizardOptions["fieldTypes"];
  types: FieldType[];
  onInsert: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom",
    strategy: "fixed",
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);
  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="wizard-insert-field"
        {...getReferenceProps({
          "aria-label": label,
          title: label,
          onKeyDown: (event) => {
            if (event.key === "Escape" && open) {
              event.stopPropagation();
              setOpen(false);
            }
          },
        })}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M7 2v10M2 7h10" />
        </svg>
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={0}
            returnFocus={false}
          >
            <Picker
              ref={refs.setFloating}
              style={floatingStyles}
              className="wizard-field-menu"
              {...getFloatingProps({
                "aria-label": translate("Choose a field type"),
                onKeyDown: (event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setOpen(false);
                    if (refs.domReference.current instanceof HTMLElement)
                      refs.domReference.current.focus();
                  }
                },
              })}
            >
              <p>{translate("Add a field")}</p>
              <div>
                {choices.map((choice) => (
                  <button
                    type="button"
                    key={choice.value}
                    onClick={() => {
                      setOpen(false);
                      onInsert(choice.value);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          types.find((type) => type.type === choice.value)
                            ?.icon ||
                            '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><rect x="1" y="3" width="14" height="10" rx="1"/></svg>',
                        ),
                      }}
                    />
                    {choice.label}
                  </button>
                ))}
              </div>
            </Picker>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
