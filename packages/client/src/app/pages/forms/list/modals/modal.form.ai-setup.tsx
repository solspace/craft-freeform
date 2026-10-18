import { ModalContainer } from "@components/modals/modal.styles";
import { ErrorBlock } from "@components/notification-blocks/error/error-block";
import config from "@config/freeform/freeform.config";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import { useEffect, useId, useRef } from "react";
import styled from "styled-components";
import {
  type Entry,
  useIntegrationNavigation,
} from "../../../integrations/sidebar/sidebar.queries";

export function AiSetupModal({
  onClose,
  onBack,
  onChoose,
}: {
  onClose: () => void;
  onBack?: () => void;
  onChoose: (path: string) => void;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, refetch } = useIntegrationNavigation();
  const entries =
    data?.find((category) => category.handle === "ai")?.entries ?? [];
  const solspace = entries.find(
    (entry) => entry.type.shortName === "SolspaceAIV1",
  );
  const others = entries.filter((entry) => entry !== solspace);
  const supported = (entry: Entry) =>
    !entry.type.editions.length ||
    entry.type.editions.includes(config.editions.edition);
  const path = (entry: Entry) =>
    `/integrations/ai/${entry.type.shortName}${entry.instances[0] ? `/${entry.instances[0].id}` : ""}`;

  useEffect(() => {
    panel.current?.focus();
  }, []);
  return (
    <Setup
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = Array.from(
          panel.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ) ?? [],
        );
        if (
          event.shiftKey &&
          (document.activeElement === buttons[0] ||
            document.activeElement === panel.current)
        ) {
          event.preventDefault();
          buttons.at(-1)?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === buttons.at(-1)
        ) {
          event.preventDefault();
          buttons[0]?.focus();
        }
      }}
    >
      <header>
        <div>
          <h1 id={titleId}>{translate("Set up AI form creation")}</h1>
          <p>
            {translate(
              "Connect and enable an AI integration to generate forms from a description or reference file.",
            )}
          </p>
        </div>
        <button
          type="button"
          className="ai-setup-close"
          aria-label={translate("Close")}
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <div className="ai-setup-content">
        {isLoading && <p role="status">{translate("Loading AI providers…")}</p>}
        {isError && (
          <ErrorBlock>
            {translate("Could not load AI providers.")}{" "}
            <button
              type="button"
              className="btn"
              onClick={() => void refetch()}
            >
              {translate("Try again")}
            </button>
          </ErrorBlock>
        )}
        {solspace && (
          <section className="ai-setup-featured">
            <div className="ai-setup-featured-heading">
              <ProviderIcon entry={solspace} />
              <div>
                <span className="ai-setup-eyebrow">
                  {translate("Built for Freeform")}
                </span>
                <h2>SolspaceAI</h2>
              </div>
            </div>
            <p>
              {translate(
                "AI from the team behind Freeform. No separate provider account or API key to manage, and models are selected for you.",
              )}
            </p>
            <div className="ai-setup-credit">
              {translate(
                "Freeform Pro includes a 1,000-credit SolspaceAI trial.",
              )}
            </div>
            <button
              type="button"
              className="btn submit"
              disabled={!supported(solspace)}
              onClick={() => onChoose(path(solspace))}
            >
              {translate("Set up SolspaceAI")} <span aria-hidden="true">→</span>
            </button>
            {!supported(solspace) && (
              <small>{translate("Requires Freeform Pro.")}</small>
            )}
          </section>
        )}
        {!!others.length && (
          <section className="ai-setup-other">
            <h2>{translate("Use your own provider")}</h2>
            <p>
              {translate(
                "Connect your existing provider account and choose the model you want to use.",
              )}
            </p>
            <div className="ai-setup-providers">
              {others.map((entry) => (
                <button
                  key={entry.type.shortName}
                  type="button"
                  className="ai-setup-provider"
                  disabled={!supported(entry)}
                  onClick={() => onChoose(path(entry))}
                >
                  <ProviderIcon entry={entry} />
                  <span>
                    <strong>{entry.type.name}</strong>
                    {!supported(entry) && (
                      <small>{translate("Requires Freeform Pro.")}</small>
                    )}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {!isLoading && !isError && !entries.length && (
          <p role="status">
            {translate(
              "No AI providers are available for this account. Contact an administrator.",
            )}
          </p>
        )}
      </div>
      <footer>
        {onBack && (
          <button type="button" className="btn" onClick={onBack}>
            ← {translate("Back")}
          </button>
        )}
        <button
          type="button"
          className="ai-setup-all"
          onClick={() => onChoose("/integrations/ai")}
        >
          {translate("View AI integrations")} →
        </button>
      </footer>
    </Setup>
  );
}

function ProviderIcon({ entry }: { entry: Entry }) {
  return (
    <span
      className="ai-setup-icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(entry.type.iconSvg ?? ""),
      }}
    />
  );
}

const Setup = styled(ModalContainer)`
  width: calc(100% - 48px); max-width: 720px; margin: 24px; max-height: calc(100dvh - 48px); display: flex; flex-direction: column; overflow: hidden;
  > header { display: flex; align-items: flex-start; gap: 16px; padding: 24px 28px; background: #edf0f8; flex: none; }
  h1 { margin: 0; font-size: 22px; line-height: 1.4; }
  header p, section p { margin: 7px 0 0; color: #65758b; font-size: 13px; line-height: 1.6; }
  .ai-setup-close { flex: none; margin-left: auto; width: 28px; height: 28px; border: 0; background: transparent; color: #65788b; font: inherit; font-size: 26px; cursor: pointer; }
  .ai-setup-content { padding: 24px 28px; min-height: 0; overflow-y: auto; }
  .ai-setup-featured { padding: 24px; border: 1px solid #d6c5ed; border-radius: 10px; background: linear-gradient(125deg, #f4effc, #fafcff); }
  .ai-setup-featured-heading { display: flex; align-items: center; gap: 14px; }
  .ai-setup-icon { display: grid; place-items: center; flex: none; width: 36px; height: 36px; }
  .ai-setup-icon > svg { width: 30px; height: 30px; }
  .ai-setup-featured .ai-setup-icon { width: 48px; height: 48px; padding: 6px; box-sizing: border-box; background: #fff; border: 1px solid #e2d9ef; border-radius: 12px; }
  .ai-setup-eyebrow { color: #76519e; font-size: 11px; font-weight: 600; }
  h2 { margin: 0; font-size: 18px; line-height: 1.4; }
  .ai-setup-credit { margin: 14px 0; color: #65448b; font-size: 12px; font-weight: 600; }
  .ai-setup-featured .btn { display: inline-flex; align-items: center; gap: 14px; }
  small { display: block; margin-top: 6px; color: #738196; font-size: 11px; }
  .ai-setup-other { margin-top: 22px; }
  .ai-setup-other h2 { font-size: 15px; }
  .ai-setup-providers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
  .ai-setup-provider { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 10px 12px; border: 1px solid #d8e1ec; border-radius: 7px; background: #fff; color: #45576b; font: inherit; text-align: start; cursor: pointer; }
  .ai-setup-provider > span:last-child { margin-left: auto; color: #75859a; }
  .ai-setup-provider:hover:not(:disabled) { background: #f6f8fc; border-color: #a9bcd3; }
  .ai-setup-provider:disabled { opacity: .6; cursor: default; }
  .ai-setup-provider strong { font-size: 13px; }
  button:focus-visible { outline: 2px solid #7857ae; outline-offset: 3px; }
  footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; border-top: 1px solid #dce4ee; background: #f4f7fb; flex: none; }
  .ai-setup-all { margin-left: auto; padding: 6px 0; border: 0; background: transparent; color: var(--link-color, #2563eb); font: inherit; font-size: 12px; cursor: pointer; }
  @media (max-width: 500px) { .ai-setup-providers { grid-template-columns: 1fr; } > header, .ai-setup-content { padding: 20px; } .ai-setup-featured { padding: 18px; } }
`;
