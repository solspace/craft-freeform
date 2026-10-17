import { FormComponent } from "@components/form-controls";
import { ModalFooter } from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { ErrorBlock } from "@components/notification-blocks/error/error-block";
import { InfoBlock } from "@components/notification-blocks/info/info-block";
import config from "@config/freeform/freeform.config";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import type { Form } from "@ff-client/types/forms";
import { PropertyType, type SelectProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GenerationError,
  type GenerationState,
  newGenerationId,
  pendingGeneration,
  pendingGenerationStartedAt,
  rememberGeneration,
  waitForGeneration,
} from "./modal.form.ai-generation";
import {
  useAiIntegrations,
  useRefreshGeneratedForms,
} from "./modal.form.create-with-ai.queries";
import { GenerationElapsed } from "./modal.form.generation-elapsed";
import { fileMimeType, referenceFileError } from "./modal.form.reference-files";
import {
  AiFormContainer,
  AiFormFields,
  AiFormHeader,
  AiFormWrapper,
  GenerationMark,
  GenerationSummary,
  PromptExamples,
  ReferenceFiles,
  ReferenceUpload,
} from "./modal.form.styles";

export const CreateWithAiFormModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const navigate = useNavigate();
  const refreshForms = useRefreshGeneratedForms();
  const defaultIntegrationUid =
    config.metadata?.freeform?.defaultAiIntegration ?? "";
  const integrationInitialized = useRef(false);
  const [integrationUid, setIntegrationUid] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedId, setCompletedId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] =
    useState<GenerationState["status"]>("running");
  const monitorController = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const resumed = useRef(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const referenceInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (completedId) refreshForms();
  }, [completedId, refreshForms]);

  const clearPending = useCallback(() => {
    rememberGeneration(null);
    setPendingId(null);
  }, []);

  const monitor = useCallback(
    async (requestId: string) => {
      monitorController.current?.abort();
      const controller = new AbortController();
      monitorController.current = controller;
      submitting.current = true;
      setIsSubmitting(true);
      setPendingId(requestId);
      setError(null);
      try {
        let queueStarted = false;
        const formId = await waitForGeneration(
          requestId,
          controller.signal,
          (status) => {
            setGenerationStatus(status);
            if (status === "queued" && !queueStarted) {
              queueStarted = true;
              if (typeof Craft !== "undefined") Craft.cp?.runQueue?.();
            }
          },
        );
        if (!mounted.current) return;
        clearPending();
        setFinishedAt(Date.now());
        setCompletedId(formId);
      } catch (error) {
        if (!mounted.current || controller.signal.aborted) return;
        if (error instanceof GenerationError && error.terminal) {
          clearPending();
          setFinishedAt(Date.now());
        }
        setError(
          error instanceof GenerationError
            ? error.message
            : translate(
                "Could not confirm generation progress. Reopen Create with AI to check again, and check the Forms list before starting another request.",
              ),
        );
      } finally {
        if (mounted.current && !controller.signal.aborted) {
          submitting.current = false;
          setIsSubmitting(false);
        }
      }
    },
    [clearPending],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      monitorController.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    const requestId = pendingGeneration();
    if (requestId) {
      setStartedAt(pendingGenerationStartedAt(requestId));
      void monitor(requestId);
    }
  }, [monitor]);

  const {
    data: aiIntegrations = [],
    isLoading: isLoadingIntegrations,
    isError: integrationError,
  } = useAiIntegrations();

  useEffect(() => {
    if (
      integrationInitialized.current ||
      isLoadingIntegrations ||
      integrationError
    )
      return;
    integrationInitialized.current = true;
    setIntegrationUid(
      aiIntegrations.find(
        (integration) => integration.uid === defaultIntegrationUid,
      )?.uid ?? "",
    );
  }, [
    aiIntegrations,
    defaultIntegrationUid,
    isLoadingIntegrations,
    integrationError,
  ]);

  const selectedIntegration = aiIntegrations.find(
    (integration) => integration.uid === integrationUid,
  );
  const accepted = selectedIntegration?.referenceMimeTypes ?? [];
  const incompatible = files.some(
    (file) => !accepted.includes(fileMimeType(file)),
  );
  const addFiles = (incoming: File[]) => {
    if (submitting.current || !accepted.length) return;
    const next = [...files, ...incoming];
    const problem = referenceFileError(next);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setFiles(next);
  };
  const moveFile = (index: number, offset: number) => {
    setFiles((files) => {
      const next = [...files];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  };

  const integrationOptions = useMemo(
    () =>
      aiIntegrations.map((int) => ({
        value: int.uid,
        label:
          int.uid === defaultIntegrationUid
            ? `${int.name} (${translate("Default")})`
            : int.name,
      })),
    [aiIntegrations, defaultIntegrationUid],
  );

  const integrationProperty = useMemo<SelectProperty>(
    () => ({
      type: PropertyType.Select,
      handle: "integrationUid",
      label: translate("AI Integration"),
      instructions: translate(
        "Choose which AI integration to use. Model and API key are already configured in the integration.",
      ),
      required: true,
      options: integrationOptions,
      emptyOption: translate("Select an AI integration..."),
    }),
    [integrationOptions],
  );

  const nameLabel = `${translate("Form name (optional)")}`;

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        if (event.key !== "Enter") return;
        const active = document.activeElement as HTMLElement | null;

        if (active?.id === "prompt") {
          event.preventDefault();
          const nameInput = document.getElementById(
            "name",
          ) as HTMLInputElement as HTMLInputElement | null;
          nameInput?.focus({ preventScroll: true });
          return;
        }

        if (
          active?.tagName === "BUTTON" ||
          (active instanceof HTMLInputElement && active.type === "file")
        )
          return;
        // For any other textarea, keep Enter for new lines.
        if (active?.tagName === "TEXTAREA") return;

        handleSubmit();
      },
    },
    [
      integrationUid,
      selectedIntegration,
      prompt,
      name,
      files,
      isSubmitting,
      isLoadingIntegrations,
      pendingId,
      completedId,
    ],
  );

  const handleSubmit = async (): Promise<void> => {
    if (submitting.current || pendingId || completedId) return;
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && !files.length) {
      setError(translate("Describe your form or attach a reference file."));
      return;
    }
    if (!selectedIntegration) {
      setError(translate("Please select an AI integration."));
      return;
    }

    const problem = referenceFileError(files);
    if (problem) {
      setError(problem);
      return;
    }
    if (incompatible) return;
    setError(null);
    submitting.current = true;
    setIsSubmitting(true);
    const requestId = newGenerationId();
    const requestStartedAt = Date.now();
    rememberGeneration(requestId, requestStartedAt);
    setStartedAt(requestStartedAt);
    setFinishedAt(null);
    setPendingId(requestId);
    setGenerationStatus("running");

    try {
      let payload:
        | FormData
        | {
            prompt: string;
            name?: string;
            integrationUid: string;
            requestId: string;
          } = {
        prompt: trimmedPrompt,
        name: name.trim() || undefined,
        integrationUid,
        requestId,
      };
      if (files.length) {
        payload = new FormData();
        payload.append("prompt", trimmedPrompt);
        payload.append("name", name.trim());
        payload.append("integrationUid", integrationUid);
        payload.append("referenceFileCount", String(files.length));
        payload.append("requestId", requestId);
        files.forEach((file) => {
          payload.append("references[]", file);
        });
      }
      const { data: form } = await axios.post<Form | GenerationState>(
        "/api/forms/generate-from-ai",
        payload,
      );

      if (!mounted.current) return;
      // Accept a synchronous response while old/new PHP and client assets roll out.
      if ("id" in form) {
        clearPending();
        setFinishedAt(Date.now());
        setCompletedId(form.id);
      } else {
        setGenerationStatus(form.status);
        await monitor(requestId);
      }
    } catch (err: unknown) {
      const gatewayFailure =
        axios.isAxiosError(err) &&
        ([502, 503, 504].includes(err.response?.status ?? 0) ||
          err.code === "ECONNABORTED" ||
          err.code === "ETIMEDOUT");
      if (!mounted.current) return;
      if (gatewayFailure || (axios.isAxiosError(err) && !err.response)) {
        // Reconnect to this same request; never resubmit the provider call.
        await monitor(requestId);
        return;
      }
      clearPending();
      setFinishedAt(Date.now());
      const message =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : null;

      setError(
        (message &&
        !/<(?:!doctype|html|head|body|script|style)\b/i.test(message)
          ? message
          : null) ??
          translate("Form generation failed. Please try again or rephrase."),
      );
    } finally {
      if (mounted.current) {
        submitting.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const compact = isSubmitting || !!pendingId || !!completedId;
  useEffect(() => {
    if (compact && mounted.current)
      closeButton.current?.focus({ preventScroll: true });
  }, [compact]);
  const handleClose = () => {
    mounted.current = false;
    monitorController.current?.abort();
    closeModal();
  };

  return (
    <AiFormContainer>
      <AiFormHeader>
        <span className="ai-intro-icon" aria-hidden="true">
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 4 2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2Z" />
            <path d="M20 3v4m-2-2h4" />
          </svg>
        </span>
        <div>
          <h1>{translate("Create a form using AI")}</h1>
          {!compact && (
            <p>
              {translate(
                "Describe what you need, or recreate a form from a PDF or image.",
              )}
            </p>
          )}
        </div>
      </AiFormHeader>

      <AiFormWrapper>
        <AiFormFields
          $collapsed={compact}
          aria-hidden={compact}
          inert={compact}
        >
          <div>
            <fieldset disabled={compact}>
              <div>
                <FormComponent
                  property={integrationProperty}
                  value={integrationUid}
                  updateValue={(v) => {
                    if (!submitting.current) setIntegrationUid(String(v ?? ""));
                  }}
                  autoFocus
                />
                {defaultIntegrationUid &&
                  !integrationUid &&
                  !isLoadingIntegrations &&
                  !integrationError &&
                  !aiIntegrations.some(
                    (integration) => integration.uid === defaultIntegrationUid,
                  ) && (
                    <InfoBlock>
                      {translate(
                        "The default AI integration is unavailable. Choose another integration to generate this form.",
                      )}
                    </InfoBlock>
                  )}
                {selectedIntegration?.model && (
                  <p className="ai-configured-model">
                    {translate("Configured model: {model}", {
                      model: selectedIntegration.model,
                    })}
                  </p>
                )}
              </div>

              <ReferenceUpload
                $dragging={dragging}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (accepted.length && !isSubmitting) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  addFiles(Array.from(event.dataTransfer.files));
                }}
              >
                <div className="reference-picker">
                  <span className="reference-symbol" aria-hidden="true">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
                      <path d="M14 3v6h6M8 13h8M8 17h5" />
                    </svg>
                  </span>
                  <div className="reference-copy">
                    <label htmlFor="ai-reference-files">
                      {translate("Reference form (optional)")}
                    </label>
                    <p>
                      {translate(
                        "Drop a PDF or image here to recreate its fields.",
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn reference-browse"
                    disabled={isSubmitting || !accepted.length}
                    onClick={() => referenceInput.current?.click()}
                  >
                    {translate(files.length ? "Add files" : "Choose files")}
                  </button>
                </div>
                <input
                  ref={referenceInput}
                  id="ai-reference-files"
                  className="reference-input"
                  tabIndex={-1}
                  type="file"
                  multiple
                  accept={accepted.join(",") || ".pdf,.png,.jpg,.jpeg"}
                  disabled={isSubmitting || !accepted.length}
                  onChange={(event) => {
                    addFiles(Array.from(event.target.files ?? []));
                    event.target.value = "";
                  }}
                  aria-describedby="ai-reference-help"
                />
                <p id="ai-reference-help">
                  {translate("Up to 5 PDF, PNG, or JPEG files. 10 MB total.")}
                </p>
                {files.length > 0 && (
                  <ReferenceFiles aria-label={translate("Reference files")}>
                    {files.map((file, index) => (
                      <li key={`${index}-${file.name}`}>
                        <span
                          className="reference-file-type"
                          aria-hidden="true"
                        >
                          {fileMimeType(file) === "application/pdf"
                            ? "PDF"
                            : "IMG"}
                        </span>
                        <span className="reference-name" title={file.name}>
                          {index + 1}. {file.name}
                        </span>
                        <span className="reference-size">
                          {Math.max(1, Math.round(file.size / 1024))} KB
                        </span>
                        {files.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="btn"
                              aria-label={translate("Move reference up")}
                              disabled={isSubmitting || index === 0}
                              onClick={() => moveFile(index, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="btn"
                              aria-label={translate("Move reference down")}
                              disabled={
                                isSubmitting || index === files.length - 1
                              }
                              onClick={() => moveFile(index, 1)}
                            >
                              ↓
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn"
                          disabled={isSubmitting}
                          aria-label={translate("Remove reference {name}", {
                            name: file.name,
                          })}
                          onClick={() => {
                            setFiles((files) =>
                              files.filter((_, i) => i !== index),
                            );
                            setError(null);
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ReferenceFiles>
                )}
                <p className="reference-note">
                  {accepted.length
                    ? translate(
                        "Files are sent to your selected AI provider. Review the generated form before using it.",
                      )
                    : translate(
                        "Choose SolspaceAI or a compatible OpenAI, Anthropic, or Gemini model to attach references. You can still generate a form from text.",
                      )}
                </p>
              </ReferenceUpload>
              <div>
                <FormComponent
                  property={{
                    type: PropertyType.Textarea,
                    handle: "prompt",
                    label: translate(
                      files.length
                        ? "Additional instructions (optional)"
                        : "Describe your form",
                    ),
                    instructions: translate(
                      files.length
                        ? "Tell AI what to include, omit, or change from the reference."
                        : "Describe the fields and purpose of the form.",
                    ),
                    required: !files.length,
                    rows: 4,
                    placeholder: translate(
                      "e.g. Contact form with name, email, phone, and a message box",
                    ),
                  }}
                  value={prompt}
                  updateValue={(v) => {
                    if (!submitting.current) setPrompt(String(v ?? ""));
                  }}
                />
                {!files.length && (
                  <PromptExamples aria-label={translate("Prompt examples")}>
                    <span>{translate("Try an example:")}</span>
                    {[
                      [
                        "Contact form",
                        "Create a contact form with name, email, phone, and a message.",
                      ],
                      [
                        "Event registration",
                        "Create an event registration form with attendee details, ticket type, dietary requirements, and a comments field.",
                      ],
                      [
                        "Quote request",
                        "Create a quote request form with contact details, service type, project description, budget, and preferred start date.",
                      ],
                    ].map(([label, example]) => (
                      <button
                        type="button"
                        className="btn"
                        key={label}
                        onClick={() => {
                          if (submitting.current) return;
                          setPrompt(translate(example));
                          document
                            .getElementById("prompt")
                            ?.focus({ preventScroll: true });
                        }}
                      >
                        {translate(label)}
                      </button>
                    ))}
                  </PromptExamples>
                )}
              </div>

              <FormComponent
                property={{
                  type: PropertyType.String,
                  handle: "name",
                  label: nameLabel,
                  placeholder: translate("e.g. Contact Form"),
                }}
                value={name}
                updateValue={(v) => {
                  if (!submitting.current) setName(String(v ?? ""));
                }}
              />
            </fieldset>
          </div>
        </AiFormFields>

        {compact && (
          <GenerationSummary role="status" aria-live="polite">
            <div className="generation-heading">
              <GenerationMark
                $complete={!!completedId}
                $active={isSubmitting}
                aria-hidden="true"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {completedId ? (
                    <path d="m6 12 4 4 8-8" />
                  ) : (
                    <>
                      <path d="m12 4 2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2Z" />
                      <path d="M20 3v4m-2-2h4" />
                    </>
                  )}
                </svg>
              </GenerationMark>
              <div>
                <h2>
                  {translate(
                    completedId
                      ? "Your form is ready"
                      : isSubmitting
                        ? generationStatus === "queued"
                          ? "Waiting for generation to start"
                          : "Creating your form"
                        : "Check generation progress",
                  )}
                </h2>
                {isSubmitting && (
                  <p className="generation-duration-hint">
                    {translate("This may take a few minutes.")}
                  </p>
                )}
                <p>
                  {translate(
                    completedId
                      ? "Your form has been saved. Open it when you are ready to review the fields and settings."
                      : "You can close this window and keep working. Reopen Create with AI to check progress. Your current work will stay open.",
                  )}
                </p>
              </div>
            </div>
            {(name.trim() || prompt.trim() || files.length > 0) && (
              <dl>
                {name.trim() && (
                  <div>
                    <dt>{translate("Form name")}</dt>
                    <dd>{name.trim()}</dd>
                  </div>
                )}
                {selectedIntegration &&
                  (files.length > 0 || prompt.trim() || name.trim()) && (
                    <div>
                      <dt>{translate("AI Integration")}</dt>
                      <dd>
                        {selectedIntegration.name}
                        {selectedIntegration.model && (
                          <span className="generation-model">
                            {selectedIntegration.model}
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                {files.length > 0 && (
                  <div>
                    <dt>{translate("Reference files")}</dt>
                    <dd>
                      {files.map((file, index) => (
                        <span
                          key={`${index}-${file.name}`}
                          className="generation-file"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            <GenerationElapsed startedAt={startedAt} finishedAt={finishedAt} />
            {isSubmitting && (
              <div className="generation-activity" aria-hidden="true">
                <span />
              </div>
            )}
          </GenerationSummary>
        )}

        {integrationError && !compact && (
          <ErrorBlock>
            {translate(
              "Could not load AI integrations. Refresh and try again.",
            )}
          </ErrorBlock>
        )}
        {incompatible && (
          <ErrorBlock>
            {translate(
              "The selected integration or model cannot read these references. Choose a compatible integration or remove the files.",
            )}
          </ErrorBlock>
        )}
        {error && <ErrorBlock>{error}</ErrorBlock>}
        {error && !compact && (
          <GenerationElapsed startedAt={startedAt} finishedAt={finishedAt} />
        )}
        {pendingId && !isSubmitting && (
          <div>
            <button
              type="button"
              className="btn"
              onClick={() => void monitor(pendingId)}
            >
              {translate("Check progress")}
            </button>{" "}
            <button
              type="button"
              className="btn"
              onClick={() => {
                clearPending();
                setCompletedId(null);
                setStartedAt(null);
                setFinishedAt(null);
                setError(null);
              }}
            >
              {translate("Start a new request")}
            </button>
          </div>
        )}
      </AiFormWrapper>

      <ModalFooter>
        <button
          ref={closeButton}
          type="button"
          className="btn cancel"
          onClick={handleClose}
        >
          {translate("Close")}
        </button>
        {completedId && (
          <button
            type="button"
            className="btn submit"
            onClick={() => {
              navigate(`/forms/${completedId}`);
              handleClose();
            }}
          >
            {translate("Open form")}
          </button>
        )}
        {!compact && (
          <button
            type="button"
            className="btn submit"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !!pendingId ||
              (!prompt.trim() && !files.length) ||
              incompatible ||
              !selectedIntegration ||
              isLoadingIntegrations
            }
          >
            {translate("Generate form")}
          </button>
        )}
      </ModalFooter>
    </AiFormContainer>
  );
};
