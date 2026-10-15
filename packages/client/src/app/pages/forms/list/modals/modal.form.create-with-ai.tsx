import { FormComponent } from "@components/form-controls";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { ModalFooter, ModalHeader } from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { ErrorBlock } from "@components/notification-blocks/error/error-block";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import type { Form } from "@ff-client/types/forms";
import { PropertyType, type SelectProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    [integrationUid, prompt, name, files, isSubmitting, isLoadingIntegrations],
  );

  const handleSubmit = async (): Promise<void> => {
    if (submitting.current) return;
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

    try {
      let payload:
        | FormData
        | { prompt: string; name?: string; integrationUid: string } = {
        prompt: trimmedPrompt,
        name: name.trim() || undefined,
        integrationUid,
      };
      if (files.length) {
        payload = new FormData();
        payload.append("prompt", trimmedPrompt);
        payload.append("name", name.trim());
        payload.append("integrationUid", integrationUid);
        payload.append("referenceFileCount", String(files.length));
        files.forEach((file) => {
          payload.append("references[]", file);
        });
      }
      const { data: form } = await axios.post<Form>(
        "/api/forms/generate-from-ai",
        payload,
      );

      navigate(`/forms/${form.id}`);
      closeModal();
    } catch (err: unknown) {
      const gatewayFailure =
        axios.isAxiosError(err) &&
        ([502, 503, 504].includes(err.response?.status ?? 0) ||
          err.code === "ECONNABORTED" ||
          err.code === "ETIMEDOUT");
      const message =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : null;

      setError(
        gatewayFailure
          ? translate(
              "The server timed out or lost its connection while generating the form. Check the Forms list before retrying; the form may still be created.",
            )
          : ((message &&
            !/<(?:!doctype|html|head|body|script|style)\b/i.test(message)
              ? message
              : null) ??
              translate(
                "Form generation failed. Please try again or rephrase.",
              )),
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
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
        {error && <ErrorBlock>{error}</ErrorBlock>}
      </AiFormWrapper>

      <ModalFooter>
        <button
          type="button"
          className="btn cancel"
          disabled={isSubmitting}
          onClick={closeModal}
        >
          {translate("Close")}
        </button>
        <button
          type="button"
          className="btn submit"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (!prompt.trim() && !files.length) ||
            incompatible ||
            !integrationUid ||
            isLoadingIntegrations
          }
        >
          <LoadingText
            loadingText={translate("Generating...")}
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
