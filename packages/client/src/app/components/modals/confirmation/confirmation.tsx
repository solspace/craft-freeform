import { useSuspendEscapeStack } from "@ff-client/contexts/escape/escape.context";
import translate from "@ff-client/utils/translations";
import { createElement, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

import {
  Actions,
  CancelButton,
  DeleteButton,
  DialogStyles,
  Message,
} from "./confirmation.styles";
import type { ConfirmationOptions } from "./confirmation.types";

type CraftDialogElement = HTMLElement & {
  opened: boolean;
  updateComplete: Promise<boolean>;
  dialogElement: HTMLDialogElement | null;
};

type Props = ConfirmationOptions & { onClose: () => void };

export const ConfirmationDialog: React.FC<Props> = ({
  title,
  message,
  onConfirm,
  onClose,
}) => {
  const ref = useRef<CraftDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const current = useRef({ onConfirm, onClose });
  current.current = { onConfirm, onClose };
  const finished = useRef(false);
  useSuspendEscapeStack();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let disposed = false;
    const cancel = () => {
      if (!finished.current) {
        finished.current = true;
        current.current.onClose();
      }
    };
    element.addEventListener("craft-before-hide", cancel);

    void customElements.whenDefined("craft-dialog").then(async () => {
      await element.updateComplete;
      if (disposed) return;
      element.opened = true;
      await element.updateComplete;
      if (!disposed) cancelRef.current?.focus();
    });

    return () => {
      disposed = true;
      element.removeEventListener("craft-before-hide", cancel);
      // Close before removing the component so focus returns to its opener.
      element.opened = false;
      element.dialogElement?.close();
    };
  }, []);

  const close = () => {
    if (finished.current) return;
    finished.current = true;
    current.current.onClose();
  };
  const confirm = () => {
    if (finished.current) return;
    finished.current = true;
    current.current.onClose();
    current.current.onConfirm();
  };

  return createPortal(
    <>
      <DialogStyles />
      {createElement(
        "craft-dialog",
        {
          ref,
          className: "ff-delete-confirmation",
          label: title,
          "no-close": true,
          onKeyDownCapture: (event: React.KeyboardEvent) => {
            // Let the native dialog handle these keys without reaching the
            // builder or the Craft slideout underneath it.
            if (event.key === "Escape" || event.key === "Tab") {
              event.stopPropagation();
            }
            if (event.key === "Tab") {
              const wrapsBack =
                event.shiftKey && event.target === cancelRef.current;
              const wrapsForward =
                !event.shiftKey && event.target === deleteRef.current;
              if (wrapsBack || wrapsForward) {
                event.preventDefault();
                (wrapsBack ? deleteRef : cancelRef).current?.focus();
              }
            }
          },
        },
        <Message>{message}</Message>,
        <Actions>
          <CancelButton ref={cancelRef} onClick={close}>
            {translate("Cancel")}
          </CancelButton>
          <DeleteButton ref={deleteRef} onClick={confirm}>
            {translate("Delete")}
          </DeleteButton>
        </Actions>,
      )}
    </>,
    document.body,
  );
};
