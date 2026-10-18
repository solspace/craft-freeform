import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import config, { Edition } from "@config/freeform/freeform.config";
import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import translate from "@ff-client/utils/translations";
import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AiSetupModal } from "./modal.form.ai-setup";
import { CreateFormModal } from "./modal.form.create";
import { CreateWithAiFormModal } from "./modal.form.create-with-ai";
import { useAiIntegrations } from "./modal.form.create-with-ai.queries";
import { useFormCreationAvailability } from "./modal.form.queries";
import {
  type FormCreationMethod,
  formCreationMethods,
} from "./modal.form.start.options";
import { FormStartArt } from "./modal.form.start-art";
import { FormCreationHeader, FormWrapper } from "./modal.form.styles";
import { WizardIcon } from "./wizard/wizard.icon";
import { WizardLoading } from "./wizard/wizard.loading";

const Wizard = lazy(() =>
  import("./wizard/wizard").then(({ FormWizardModal }) => ({
    default: FormWizardModal,
  })),
);

export function StartFormModal({ closeModal }: ModalContainerProps) {
  const { data, isFetching, isError, refetch } = useFormCreationAvailability();
  const needsCheck = config.editions.edition === Edition.Express;
  const blocked = needsCheck && (isFetching || isError || !data?.canCreate);

  if (!blocked) return <FormCreationChooser closeModal={closeModal} />;

  return (
    <FormLimitModal
      closeModal={closeModal}
      status={isFetching ? "loading" : isError || !data ? "error" : "limit"}
      onRetry={() => void refetch()}
    />
  );
}

export function FormLimitModal({
  closeModal,
  status = "limit",
  onRetry,
}: ModalContainerProps & {
  status?: "loading" | "error" | "limit";
  onRetry?: () => void;
}) {
  const isFetching = status === "loading";
  const isError = status === "error";
  const limitReached = status === "limit";
  const titleId = useId();
  const descriptionId = useId();
  const closeButton = useRef<HTMLButtonElement>(null);
  useEscapeStack(closeModal);

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  return (
    <AvailabilityModal
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not(:disabled), a[href]",
          ),
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <FormCreationHeader>
        <span className="form-heading-icon" aria-hidden="true">
          <WizardIcon kind="blank" />
        </span>
        <div>
          <span className="form-limit-edition">Freeform Express</span>
          <h1 id={titleId}>
            {translate(limitReached ? "Need more forms?" : "Add new form")}
          </h1>
        </div>
      </FormCreationHeader>
      <FormWrapper>
        <p id={descriptionId} role="status">
          {translate(
            isFetching
              ? "Loading…"
              : isError
                ? "Could not check the form limit. Please try again."
                : "Express includes one form, and yours is already set up.",
          )}
        </p>
        {limitReached && (
          <div className="form-limit-upgrade">
            <strong>{translate("Upgrade to Lite or Pro")}</strong>
            <p>{translate("Both editions include unlimited forms.")}</p>
          </div>
        )}
      </FormWrapper>
      <ModalFooter>
        {isError && (
          <button type="button" className="btn" onClick={onRetry}>
            {translate("Try again")}
          </button>
        )}
        <button
          ref={closeButton}
          type="button"
          className="btn"
          onClick={closeModal}
        >
          {translate("Close")}
        </button>
        {limitReached && (
          <a
            className="btn form-limit-compare"
            href="https://docs.solspace.com/craft/freeform/v5/#pricing"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translate("Compare editions")}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
            </svg>
          </a>
        )}
      </ModalFooter>
    </AvailabilityModal>
  );
}

const AvailabilityModal = styled(ModalContainer)`
  width: calc(100% - 40px);
  max-width: 480px;
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 24px 80px rgba(31, 41, 51, 0.28);

  > header { padding: 24px 28px; }
  h1 { font-size: 21px; line-height: 1.35; }
  .form-limit-edition {
    display: block;
    margin-bottom: 4px;
    color: #617488;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  > ${FormWrapper} { padding: 24px 28px; gap: 20px; }
  p { margin: 0; font-size: 14px; line-height: 1.65; color: #526578; }
  .form-limit-upgrade {
    padding: 16px;
    border: 1px solid #d5e1ed;
    border-radius: 8px;
    background: #f5f8fc;
  }
  .form-limit-upgrade strong { color: #345c85; font-size: 14px; line-height: 24px; }
  .form-limit-upgrade p { margin-top: 3px; font-size: 13px; color: #617488; }
  > footer { padding: 16px 28px; background: #fff; flex-wrap: wrap; }
  .form-limit-compare {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #3476b8;
    color: #fff;
    font-weight: 600;
    text-decoration: none;
  }
  .form-limit-compare:hover { background: #28649f; }
  .form-limit-compare svg { flex: none; }
  button:focus-visible, a:focus-visible { outline: 2px solid #3476b8; outline-offset: 3px; }
  @media (max-width: 480px) {
    > header, > ${FormWrapper} { padding: 20px; }
    > footer { padding: 16px 20px; }
  }
`;

function FormCreationChooser({ closeModal }: ModalContainerProps) {
  const methods = formCreationMethods(
    config.metadata?.freeform?.formCreationOptions,
    config.editions.edition,
  );
  const onlyMethod = methods.length === 1 ? methods[0] : undefined;
  const [method, setMethod] = useState<FormCreationMethod | "ai-setup">(
    onlyMethod === "ai" ? undefined : onlyMethod,
  );
  const [nextMethod, setNextMethod] = useState<
    FormCreationMethod | "ai-setup"
  >();
  const automaticAiStarted = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const navigate = useNavigate();
  const { data: integrations, isLoading } = useAiIntegrations();
  const canUseAi = config.permissions.integrations !== "none";
  const needsAiSetup = integrations?.length === 0;
  const dismiss = () => {
    setNextMethod(undefined);
    closeModal();
  };
  useEscapeStack(dismiss, method !== "wizard");

  useEffect(() => {
    if (
      onlyMethod === "ai" &&
      canUseAi &&
      !isLoading &&
      !automaticAiStarted.current
    ) {
      automaticAiStarted.current = true;
      setNextMethod(needsAiSetup ? "ai-setup" : "ai");
    }
  }, [onlyMethod, canUseAi, isLoading, needsAiSetup]);

  useEffect(() => {
    if (!nextMethod) return;
    dialog.current?.focus();
    const proceed = () => {
      setNextMethod(undefined);
      setMethod(nextMethod);
    };
    if (
      onlyMethod ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      proceed();
      return;
    }
    const timer = window.setTimeout(proceed, 180);
    return () => window.clearTimeout(timer);
  }, [nextMethod, onlyMethod]);

  useEffect(() => {
    if (!method)
      dialog.current
        ?.querySelector<HTMLButtonElement>(".form-start-card")
        ?.focus();
  }, [method]);

  if (method === "wizard")
    return (
      <Suspense fallback={<WizardLoading closeModal={closeModal} />}>
        <Wizard closeModal={closeModal} />
      </Suspense>
    );
  if (method === "ai")
    return (
      <FlowEntrance>
        <CreateWithAiFormModal closeModal={closeModal} />
      </FlowEntrance>
    );
  if (method === "blank")
    return (
      <FlowEntrance>
        <CreateFormModal closeModal={closeModal} />
      </FlowEntrance>
    );
  if (method === "ai-setup")
    return (
      <FlowEntrance>
        <AiSetupModal
          onClose={dismiss}
          onBack={onlyMethod ? undefined : () => setMethod(undefined)}
          onChoose={(path) => {
            dismiss();
            navigate(path);
          }}
        />
      </FlowEntrance>
    );
  if (onlyMethod === "ai")
    return (
      <ModalContainer
        role="dialog"
        aria-modal="true"
        aria-label={translate("Create with AI")}
      >
        <ModalHeader>
          <h1>{translate("Create with AI")}</h1>
        </ModalHeader>
        <FormWrapper>
          <p role="status">
            {translate(
              canUseAi
                ? "Loading…"
                : "AI integrations are not available with your permissions.",
            )}
          </p>
        </FormWrapper>
        <ModalFooter>
          <button type="button" className="btn" onClick={dismiss}>
            {translate("Close")}
          </button>
        </ModalFooter>
      </ModalContainer>
    );

  const cards: {
    method: FormCreationMethod;
    title: string;
    description: string;
    action: string;
    unavailable?: boolean;
    note?: string;
  }[] = [
    {
      method: "wizard",
      title: translate("Guided setup"),
      description: translate(
        "Choose a starting point and configure fields, appearance, behavior, and emails step by step.",
      ),
      action: translate("Open guided setup"),
    },
    {
      method: "ai",
      title: translate("Create with AI"),
      description: translate(
        "Describe the form you need or provide a reference file. AI generates a starting form for you to review and edit.",
      ),
      action: translate(
        isLoading ? "Loading…" : needsAiSetup ? "Set up AI" : "Open AI setup",
      ),
      unavailable: !canUseAi || isLoading,
      note: !canUseAi
        ? translate("AI integrations are not available with your permissions.")
        : needsAiSetup
          ? translate(
              "Choose SolspaceAI or connect your own provider to use this option.",
            )
          : undefined,
    },
    {
      method: "blank",
      title: translate("Quick setup"),
      description: translate(
        "Start with a blank form or sample fields, then customize everything in the builder.",
      ),
      action: translate("Open quick setup"),
    },
  ];

  return (
    <Chooser
      $optionCount={methods.length}
      ref={dialog}
      role="dialog"
      tabIndex={-1}
      data-leaving={!!nextMethod}
      aria-busy={!!nextMethod}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        if (nextMethod) {
          event.preventDefault();
          return;
        }
        const buttons = Array.from(
          dialog.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ) ?? [],
        );
        const first = buttons[0],
          last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <header>
        <div>
          <h1 id={titleId}>{translate("Add new form")}</h1>
          <p id={descriptionId}>
            {translate(
              "Choose how to start your form. You can customize it in the builder afterward.",
            )}
          </p>
        </div>
        <button
          type="button"
          className="form-start-close"
          aria-label={translate("Close")}
          onClick={dismiss}
          disabled={!!nextMethod}
        >
          ×
        </button>
      </header>
      {!methods.length && (
        <FormWrapper>
          <p role="status">
            {translate(
              "No form creation options are available. Contact an administrator.",
            )}
          </p>
        </FormWrapper>
      )}
      <div className="form-start-options">
        {cards
          .filter((card) => methods.includes(card.method))
          .map((card) => (
            <button
              key={card.method}
              type="button"
              className="form-start-card"
              data-method={card.method}
              data-selected={
                nextMethod === card.method ||
                (card.method === "ai" && nextMethod === "ai-setup")
              }
              data-unavailable={!!card.unavailable}
              data-setup={card.method === "ai" && needsAiSetup}
              aria-label={card.title}
              aria-describedby={`${descriptionId}-${card.method}${card.note ? ` ${descriptionId}-${card.method}-note` : ""}`}
              disabled={card.unavailable || !!nextMethod}
              onClick={() =>
                setNextMethod(
                  card.method === "ai" && needsAiSetup
                    ? "ai-setup"
                    : card.method,
                )
              }
            >
              <FormStartArt method={card.method} />
              <strong>{card.title}</strong>
              <span
                className="form-start-description"
                id={`${descriptionId}-${card.method}`}
              >
                {card.description}
              </span>
              {card.note && (
                <span
                  className="form-start-note"
                  id={`${descriptionId}-${card.method}-note`}
                >
                  {card.note}
                </span>
              )}
              <span className="form-start-action">
                {card.action}
                <span aria-hidden="true">→</span>
              </span>
            </button>
          ))}
      </div>
    </Chooser>
  );
}

const FlowEntrance = styled.div`
  display: contents;
  > * { animation: form-flow-enter .28s cubic-bezier(.22, 1, .36, 1) both; }
  @keyframes form-flow-enter { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { > * { animation: none; } }
`;

const Chooser = styled(ModalContainer)<{ $optionCount: number }>`
  box-sizing: border-box; max-width: ${({ $optionCount }) => ($optionCount === 2 ? "720px" : "1020px")}; width: calc(100% - 48px); margin: 24px;
  max-height: calc(100dvh - 48px); overflow-y: auto;
  transition: opacity .18s ease, transform .18s ease;
  &[data-leaving=true] { opacity: 0; transform: translateY(-4px) scale(.985); pointer-events: none; }
  > header { display: flex; align-items: flex-start; gap: 20px; padding: 26px 28px; background: var(--gray-100, #e9eff6); border-radius: inherit; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
  h1 { margin: 0; font-size: 22px; line-height: 1.3; }
  header p { margin: 7px 0 0; color: #65788b; font-size: 13px; line-height: 1.5; }
  .form-start-close { flex: none; margin-left: auto; padding: 0; width: 28px; height: 28px; border: 0; background: transparent; color: #65788b; cursor: pointer; font-size: 26px; line-height: 1; border-radius: 4px; }
  .form-start-options { display: grid; grid-template-columns: repeat(${({ $optionCount }) => Math.max(1, $optionCount)}, minmax(0, 1fr)); gap: 16px; padding: 28px; }
  .form-start-card { --method-color: #3476b8; --method-wash: #edf5fd; --method-border: #b5cfe9;
    position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; aspect-ratio: 1; padding: 18px; text-align: start; font: inherit; color: #3f4d5a; border: 1px solid #d5e0eb; border-radius: 12px;
    background: linear-gradient(155deg, var(--method-wash), #fff 60%); cursor: pointer;
    transition: border-color .18s, box-shadow .18s, transform .18s;
  }
  [data-method=ai] { --method-color: #8657c5; --method-wash: #f5effc; --method-border: #cfb9e8; }
  [data-method=blank] { --method-color: #2e8b81; --method-wash: #edf8f5; --method-border: #a9d4cb; }
  .form-start-card:hover:not(:disabled) { border-color: var(--method-color); transform: translateY(-3px); box-shadow: 0 8px 24px #3f6b9a15; }
  .form-start-card[data-setup=true] .form-start-action { border-top-style: dashed; }
  .form-start-card[data-selected=true] { border-color: var(--method-color); }
  button:focus-visible { outline: 2px solid var(--method-color, #387ebf); outline-offset: 3px; }
  .form-start-art { position: relative; display: grid; place-items: center; width: 100%; height: 100px; flex: none; border: 1px solid var(--method-border); border-radius: 8px; color: var(--method-color);
    background: radial-gradient(circle at 1px 1px, var(--method-border) .6px, transparent .9px) 0 0 / 9px 9px, var(--method-wash); overflow: hidden; }
  .form-start-art > svg { display: block; width: 100%; height: 100%; }
  .form-start-art-sheet { transition: translate .25s ease; }
  .form-start-card:hover:not(:disabled) .form-start-art-sheet, .form-start-card:focus-visible .form-start-art-sheet { translate: 0 -3px; }
  .form-start-art-spark { transform-origin: 195px 39px; transition: transform .3s ease; }
  .form-start-card:hover:not(:disabled) .form-start-art-spark { transform: rotate(12deg) scale(1.08); }
  strong { font-size: 17px; line-height: 1.4; }
  .form-start-description, .form-start-note { font-size: 12px; line-height: 1.6; color: #65788b; }
  .form-start-note { font-size: 11px; }
  .form-start-action { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; box-sizing: border-box; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--method-border); font-size: 12px; font-weight: 600; color: var(--method-color); }
  .form-start-action > span { display: grid; place-items: center; width: 23px; height: 23px; border-radius: 50%; background: var(--method-wash); font-size: 16px; transition: translate .18s; }
  .form-start-card:hover:not(:disabled) .form-start-action > span { translate: 2px 0; }
  .form-start-card[data-unavailable=true] { cursor: default; background: #f7f8fa; }
  .form-start-card[data-unavailable=true] .form-start-art { filter: grayscale(.7); opacity: .65; }
  .form-start-card[data-unavailable=true] .form-start-action { color: #718196; }
  @media (max-width: 700px) {
    .form-start-options { grid-template-columns: 1fr; padding: 20px; gap: 12px; }
    .form-start-card { aspect-ratio: auto; gap: 8px; padding: 18px; }
    .form-start-art { height: 90px; }
    > header { padding: 20px; }
  }
  @media (prefers-reduced-motion: reduce) { &, .form-start-card, .form-start-art-sheet, .form-start-art-spark, .form-start-action > span { transition: none; } .form-start-card:hover:not(:disabled) { transform: none; } .form-start-card:hover:not(:disabled) .form-start-art-sheet { translate: none; } }
`;
