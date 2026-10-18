import { ConfirmationDialog } from "@components/modals/confirmation/confirmation";
import translate from "@ff-client/utils/translations";

export const LabelUpdateConfirmation = ({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ConfirmationDialog
    title={translate(
      count === 1 ? "Update 1 label?" : "Update {count} labels?",
      { count },
    )}
    message={translate(
      "Field handles remain unchanged. You can undo this update in one step.",
    )}
    confirmLabel={translate("Update labels ({count})", { count })}
    destructive={false}
    onClose={onCancel}
    onConfirm={onConfirm}
  />
);
