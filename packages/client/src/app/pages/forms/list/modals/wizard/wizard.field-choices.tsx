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
import { useState } from "react";
import styled from "styled-components";
import type { WizardField } from "./wizard.types";

const Popover = styled.div`
  z-index: 1100; box-sizing: border-box; width: 280px; max-width: calc(100vw - 32px); padding: 16px; background: #fff; border: 1px solid #c8d7e6; border-radius: 6px; box-shadow: 0 6px 24px #304e6b30; color: #3f4d5a;
  label { display: block; font-size: 13px; font-weight: 600; }
  textarea { box-sizing: border-box; width: 100%; min-height: 110px; margin: 8px 0; border: 1px solid #c8d4e1; border-radius: 4px; padding: 8px; font: inherit; font-size: 13px; resize: vertical; }
  textarea[aria-invalid=true] { border-color: #cf1124; box-shadow: 0 0 0 1px #cf112433; }
  p { font-size: 12px; color: #6b7c8d; margin: 0 0 12px; }
`;

export function WizardFieldChoices({
  field,
  disabled,
  onChange,
  invalid = false,
  errorId,
}: {
  field: WizardField;
  disabled: boolean;
  onChange: (options: string[]) => void;
  invalid?: boolean;
  errorId?: string;
}) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
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
        className="wizard-field-small-action"
        disabled={disabled}
        {...getReferenceProps({
          "aria-label": translate("Edit choices for {label}", {
            label: field.label,
          }),
          title: translate("Edit choices"),
          onKeyDown: (event) => {
            if (open && event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
            }
          },
        })}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden="true"
        >
          <path d="M5 3h10M5 8h10M5 13h10" />
          <path d="M1 3h1M1 8h1M1 13h1" strokeWidth="2" />
        </svg>
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={0}
          >
            <Popover
              ref={refs.setFloating}
              style={floatingStyles}
              className="wizard-field-options"
              {...getFloatingProps({
                "aria-label": translate("Choices for {label}", {
                  label: field.label,
                }),
                onKeyDown: (event) => {
                  if (event.key === "Escape") event.stopPropagation();
                },
              })}
            >
              <label>
                {translate("Choices")}
                <textarea
                  rows={5}
                  aria-invalid={invalid || undefined}
                  aria-errormessage={invalid ? errorId : undefined}
                  value={field.options.join("\n")}
                  onChange={(event) => onChange(event.target.value.split("\n"))}
                />
              </label>
              <p>{translate("Enter one choice per line.")}</p>
              <button
                className="btn"
                type="button"
                onClick={() => setOpen(false)}
              >
                {translate("Done")}
              </button>
            </Popover>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
