import { useModal } from "@components/modals/modal.context";
import translate from "@ff-client/utils/translations";

export const useConfirmLeaveBuilder = (): ((url: string) => void) => {
  const { confirm } = useModal();

  return (url) => {
    confirm({
      title: translate("Leave the form builder?"),
      message: translate(
        "You are about to leave the form builder. Any unsaved changes may be lost if you continue.",
      ),
      confirmLabel: translate("Continue"),
      destructive: false,
      onConfirm: () => {
        window.location.href = url;
      },
    });
  };
};
