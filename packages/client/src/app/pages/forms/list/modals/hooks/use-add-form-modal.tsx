import { useModal } from "@components/modals/modal.context";
import { FormLimitModal, StartFormModal } from "../modal.form.start";

export function useAddFormModal(): () => void {
  const { openModal } = useModal();
  return () =>
    openModal((props) => <StartFormModal {...props} />, undefined, {
      allowEscape: false,
      animation: "fade",
    });
}

export function useFormLimitModal(): () => void {
  const { openModal } = useModal();
  return () =>
    openModal((props) => <FormLimitModal {...props} />, undefined, {
      allowEscape: false,
      animation: "fade",
    });
}
