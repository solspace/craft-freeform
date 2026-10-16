import { FormComponent } from "@components/form-controls";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { ModalFooter, ModalHeader } from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { ErrorBlock } from "@components/notification-blocks/error/error-block";
import { InfoBlock } from "@components/notification-blocks/info/info-block";
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
  rememberGeneration,
  waitForGeneration,
} from "./modal.form.ai-generation";
import { useAiIntegrations } from "./modal.form.create-with-ai.queries";
import { fileMimeType, referenceFileError } from "./modal.form.reference-files";
import {
  AiFormContainer,
  AiFormWrapper,
  ReferenceFiles,
  ReferenceUpload,
} from "./modal.form.styles";

export const CreateWithAiFormModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const navigate = useNavigate();
  const [integrationUid, setIntegrationUid] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        navigate(`/forms/${formId}`);
        closeModal();
      } catch (error) {
        if (!mounted.current || controller.signal.aborted) return;
        if (error instanceof GenerationError && error.terminal) clearPending();
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
    [clearPending, navigate, closeModal],
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
    if (requestId) void monitor(requestId);
  }, [monitor]);

  const {
    data: aiIntegrations = [],
    isLoading: isLoadingIntegrations,
    isError: integrationError,
  } = useAiIntegrations();

  useEffect(() => {
    if (aiIntegrations.length > 0 && !integrationUid) {
      setIntegrationUid(aiIntegrations[0].uid);
    }
  }, [aiIntegrations, integrationUid]);

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
    () => aiIntegrations.map((int) => ({ value: int.uid, label: int.name })),
    [aiIntegrations],
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
      prompt,
      name,
      files,
      isSubmitting,
      isLoadingIntegrations,
      pendingId,
    ],
  );

  const handleSubmit = async (): Promise<void> => {
    if (submitting.current || pendingId) return;
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && !files.length) {
      setError(translate("Describe your form or attach a reference file."));
      return;
    }
    if (!integrationUid) {
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
    rememberGeneration(requestId);
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
        navigate(`/forms/${form.id}`);
        closeModal();
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

  return (
    <AiFormContainer>
      <ModalHeader>
        <h1>{translate("Create a form using AI")}</h1>
      </ModalHeader>

      <AiFormWrapper aria-busy={isSubmitting}>
        <FormComponent
          property={integrationProperty}
          value={integrationUid}
          updateValue={(v) => {
            if (!submitting.current) setIntegrationUid(String(v ?? ""));
          }}
          autoFocus
        />

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
          <label htmlFor="ai-reference-files">
            {translate("Reference form (optional)")}
          </label>
          <input
            id="ai-reference-files"
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
            {translate(
              "Choose files or drop them here. Up to 5 PDF, PNG, or JPEG files, 10 MB total. Files are processed in the order shown.",
            )}
          </p>
          <p>
            {accepted.length
              ? translate(
                  "References are sent to the selected AI provider. Review the generated fields and settings before using the form.",
                )
              : translate(
                  "Choose SolspaceAI or a compatible OpenAI, Anthropic, or Gemini model to attach references. You can still generate a form from text.",
                )}
          </p>
          {selectedIntegration?.model && (
            <p>
              {translate("Configured model: {model}", {
                model: selectedIntegration.model,
              })}
            </p>
          )}
          {files.length > 0 && (
            <ReferenceFiles aria-label={translate("Reference files")}>
              {files.map((file, index) => (
                <li key={`${index}-${file.name}`}>
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
                        disabled={isSubmitting || index === files.length - 1}
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
                      setFiles((files) => files.filter((_, i) => i !== index));
                      setError(null);
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ReferenceFiles>
          )}
        </ReferenceUpload>
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

        {integrationError && (
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
        {pendingId && isSubmitting && (
          <InfoBlock>
            {translate(
              generationStatus === "queued"
                ? "Waiting for Craft's queue. If this does not start, check the Queue Manager."
                : "Generating your form. You can close this window and reopen Create with AI to check progress and finish creating the form.",
            )}
          </InfoBlock>
        )}
        {error && <ErrorBlock>{error}</ErrorBlock>}
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
                setError(null);
              }}
            >
              {translate("Start a new request")}
            </button>
          </div>
        )}
      </AiFormWrapper>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Close")}
        </button>
        <button
          type="button"
          className="btn submit"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !!pendingId ||
            (!prompt.trim() && !files.length) ||
            incompatible ||
            !integrationUid ||
            isLoadingIntegrations
          }
        >
          <LoadingText
            loadingText={translate(
              generationStatus === "queued"
                ? "Waiting for queue..."
                : "Generating...",
            )}
            loading={isSubmitting}
            spinner
          >
            {translate("Generate form")}
          </LoadingText>
        </button>
      </ModalFooter>
    </AiFormContainer>
  );
};
