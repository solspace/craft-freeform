import { ModalContainer } from "@components/modals/modal.styles";
import translate from "@ff-client/utils/translations";
import styled from "styled-components";
import { WizardIcon } from "./wizard.icon";

const Loading = styled(ModalContainer)`
  box-sizing: border-box; max-width: 380px; margin: 24px; padding: 24px;
  animation: wizard-loading-in .25s ease-out;
  header { display: flex; align-items: center; gap: 12px; }
  header > svg { flex: none; color: #4775a6; }
  h1 { margin: 0; font-size: 18px; }
  p { margin: 16px 0; color: #62758a; }
  .wizard-loading-track { height: 3px; margin-bottom: 18px; overflow: hidden; border-radius: 3px; background: #e4edf6; }
  .wizard-loading-track::after { content: ""; display: block; height: 100%; width: 40%; background: #7da9ce; animation: wizard-loading-progress 1.3s ease-in-out infinite; }
  footer { display: flex; justify-content: flex-end; gap: 8px; }
  @keyframes wizard-loading-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes wizard-loading-progress { from { transform: translateX(-100%); } to { transform: translateX(350%); } }
  @media (prefers-reduced-motion: reduce) { &, .wizard-loading-track::after { animation: none; } .wizard-loading-track::after { width: 100%; } }
`;

export function WizardLoading({
  closeModal,
  isError = false,
  onRetry,
}: {
  closeModal: () => void;
  isError?: boolean;
  onRetry?: () => void;
}) {
  return (
    <Loading
      role="dialog"
      aria-modal="true"
      aria-label={translate("Guided form setup")}
    >
      <header>
        <WizardIcon kind="wizard" />
        <h1>{translate("Guided form setup")}</h1>
      </header>
      <p role="status">
        {translate(
          isError ? "Could not load form setup." : "Preparing guided setup…",
        )}
      </p>
      {!isError && <div className="wizard-loading-track" aria-hidden="true" />}
      <footer>
        {isError && (
          <button type="button" className="btn" onClick={onRetry}>
            {translate("Try again")}
          </button>
        )}
        <button type="button" className="btn" onClick={closeModal}>
          {translate("Close")}
        </button>
      </footer>
    </Loading>
  );
}
