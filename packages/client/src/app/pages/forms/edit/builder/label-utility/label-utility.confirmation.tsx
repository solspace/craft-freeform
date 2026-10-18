import { ModalFooter, ModalHeader } from "@components/modals/modal.styles";
import translate from "@ff-client/utils/translations";
import { useEffect, useId, useRef } from "react";
import { LabelConfirmationDialog } from "./label-utility.styles";

export const LabelUpdateConfirmation = ({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      if (element?.open) element.close();
    };
  }, []);

  return (
    <LabelConfirmationDialog
      as="dialog"
      ref={dialog}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
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
        <h2 id={titleId}>
          {translate(
            count === 1 ? "Update 1 label?" : "Update {count} labels?",
            {
              count,
            },
          )}
        </h2>
      </ModalHeader>
      <div className="utility-confirmation-body" id={descriptionId}>
        {translate(
          "Field handles remain unchanged. You can undo this update in one step.",
        )}
      </div>
      <ModalFooter>
        <button
          type="button"
          className="btn cancel"
          onClick={onCancel}
          autoFocus
        >
          {translate("Cancel")}
        </button>
        <button type="button" className="btn submit" onClick={onConfirm}>
          {translate("Update labels ({count})", { count })}
        </button>
      </ModalFooter>
    </LabelConfirmationDialog>
  );
};
