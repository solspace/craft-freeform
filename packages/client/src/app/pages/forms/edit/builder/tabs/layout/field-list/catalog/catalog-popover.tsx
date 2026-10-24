import { useAppSelector } from "@editor/store";
import translate from "@ff-client/utils/translations";
import CrossIcon from "@ff-icons/actions/delete";
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
} from "@floating-ui/react";
import DOMPurify from "dompurify";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { ConnectDragSource } from "react-dnd";
import { CatalogButton, CatalogMenu } from "./catalog.styles";

export const CatalogPopover: React.FC<{
  name: string;
  icon?: string;
  dragRef?: ConnectDragSource;
  wide?: boolean;
  children: (close: () => void) => React.ReactNode;
}> = ({ name, icon = "", dragRef, wide, children }) => {
  const [open, setOpen] = useState(false);
  const focus = useAppSelector((state) => state.context.focus);
  useEffect(() => {
    if (focus.active) setOpen(false);
  }, [focus]);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "right-start",
    middleware: [offset(9), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);
  const connect = useCallback(
    (element: HTMLButtonElement | null) => {
      refs.setReference(element);
      dragRef?.(element);
    },
    [refs.setReference, dragRef],
  );
  return (
    <>
      <CatalogButton
        ref={connect}
        {...getReferenceProps()}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span
          style={{ flex: "0 0 16px", display: "flex", alignItems: "center" }}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(icon) }}
        />
        <span>{translate(name)}</span>
        <span style={{ flex: "0 0 auto" }} aria-hidden="true">
          ›
        </span>
      </CatalogButton>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <CatalogMenu
              $wide={wide}
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              role="dialog"
              aria-label={translate(name)}
            >
              <h3>
                {translate(name)}
                <button
                  type="button"
                  aria-label={translate("Close")}
                  onClick={() => setOpen(false)}
                >
                  <CrossIcon />
                </button>
              </h3>
              {children(() => setOpen(false))}
            </CatalogMenu>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
