import { ModalFooter, ModalHeader } from "@components/modals/modal.styles";
import { useSuspendEscapeStack } from "@ff-client/contexts/escape/escape.context";
import translate from "@ff-client/utils/translations";
import { useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ConfirmationContainer,
  ConfirmButton,
  Message,
} from "./confirmation.styles";
import type { ConfirmationOptions } from "./confirmation.types";

type Props = ConfirmationOptions & { onClose: () => void };

// Craft 5 doesn't have Craft 6's <craft-dialog>. A native modal dialog keeps the
// same confirmation API and focus behavior above both modals and slideouts.
export const ConfirmationDialog: React.FC<Props> = ({
  title,
  message,
  onConfirm,
  confirmLabel = translate("Delete"),
  destructive = true,
  onClose,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const finished = useRef(false);
  const current = useRef({ onConfirm, onClose });
  current.current = { onConfirm, onClose };
  useSuspendEscapeStack();

  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      if (element?.open) element.close();
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
    <ConfirmationContainer
      as="dialog"
      className="ff-delete-confirmation"
      ref={dialog}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        } else if (event.key === "Tab") {
          const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          );
          const first = buttons?.[0];
          const last = buttons?.[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <ModalHeader>
        <h2 id={titleId}>{title}</h2>
      </ModalHeader>
      <Message id={descriptionId}>{message}</Message>
      <ModalFooter>
        <button type="button" className="btn cancel" onClick={close} autoFocus>
          {translate("Cancel")}
        </button>
        <ConfirmButton $destructive={destructive} onClick={confirm}>
          {confirmLabel}
        </ConfirmButton>
      </ModalFooter>
    </ConfirmationContainer>,
    document.body,
  );
};
