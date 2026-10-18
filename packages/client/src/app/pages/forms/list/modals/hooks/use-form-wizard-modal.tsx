import { useModal } from "@components/modals/modal.context";
import { lazy, Suspense } from "react";
import { WizardLoading } from "../wizard/wizard.loading";

const Wizard = lazy(() =>
  import("../wizard/wizard").then((module) => ({
    default: module.FormWizardModal,
  })),
);

export function useFormWizardModal(): () => void {
  const { openModal } = useModal();
  return () =>
    openModal(
      (props) => (
        <Suspense fallback={<WizardLoading closeModal={props.closeModal} />}>
          <Wizard {...props} />
        </Suspense>
      ),
      undefined,
      { allowEscape: false, animation: "fade" },
    );
}
