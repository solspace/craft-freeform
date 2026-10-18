import { InfoBlock } from "@components/notification-blocks/info/info-block";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { WizardPreviewPane } from "./wizard.styles";
import { fieldRows, type WizardDraft, type WizardField } from "./wizard.types";

function FieldPreview({
  field,
  showError,
}: {
  field: WizardField;
  showError: boolean;
}) {
  const id = `wizard-preview-${field.key}`;
  let input: React.ReactNode;
  if (field.type === "rating") {
    input = (
      <div
        role="img"
        className="wizard-preview-stars"
        aria-label={translate("Five stars")}
      >
        ☆☆☆☆☆
      </div>
    );
  } else if (["radios", "checkboxes"].includes(field.type)) {
    input = (
      <div className="wizard-preview-options">
        {field.options.map((choice, index) => (
          <label key={`${index}-${choice}`}>
            <input
              type={field.type === "radios" ? "radio" : "checkbox"}
              disabled
            />
            {choice}
          </label>
        ))}
      </div>
    );
  } else if (field.type === "dropdown") {
    input = (
      <select id={id} disabled>
        <option>{translate("Please select")}</option>
        {field.options.map((choice, index) => (
          <option key={`${index}-${choice}`}>{choice}</option>
        ))}
      </select>
    );
  } else if (field.type === "textarea") {
    input = <textarea id={id} rows={3} disabled />;
  } else if (field.type === "file") {
    input = <input id={id} type="file" disabled />;
  } else {
    input = (
      <input
        id={id}
        type={field.type === "number" ? "number" : "text"}
        placeholder={field.type === "datetime" ? "YYYY-MM-DD" : ""}
        disabled
      />
    );
  }
  return (
    <div
      className="wizard-preview-field"
      data-error={showError && field.required}
      key={`${field.key}-${field.label}-${field.width}-${field.type}`}
    >
      {["radios", "checkboxes", "rating"].includes(field.type) ? (
        <div style={{ fontSize: 11, marginBottom: 5 }}>
          {field.label}
          {field.required && " *"}
        </div>
      ) : (
        <label htmlFor={id}>
          {field.label}
          {field.required && " *"}
        </label>
      )}
      {input}
      {showError && field.required && (
        <small className="wizard-preview-field-error">
          {translate("This field is required")}
        </small>
      )}
      {field.instructions && <small>{field.instructions}</small>}
    </div>
  );
}

export function WizardPreview({
  draft,
  showSuccess,
  showError,
  templateMode,
  setTemplateMode,
  templateOnly = false,
}: {
  draft: WizardDraft;
  showSuccess: boolean;
  showError: boolean;
  templateMode: boolean;
  setTemplateMode: (value: boolean) => void;
  templateOnly?: boolean;
}) {
  const renderTemplate = templateOnly || templateMode;
  const [size, setSize] = useState<"desktop" | "tablet" | "phone">("desktop");
  const stage = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState({ width: 400, height: 500 });
  const canvasWidth = { desktop: 1200, tablet: 800, phone: 390 }[size];
  const scale = Math.min(1, available.width / canvasWidth);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const measure = () =>
      setAvailable({
        width: Math.max(1, element.clientWidth),
        height: Math.max(1, element.clientHeight),
      });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!renderTemplate || !draft.fields.length) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      axios
        .post<{ html: string }>(
          "/api/forms/wizard/preview",
          { ...draft, previewSuccess: showSuccess, previewError: showError },
          {
            signal: controller.signal,
          },
        )
        .then(({ data }) => {
          if (!controller.signal.aborted) setHtml(data.html);
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setHtml("");
            setError(
              error.response?.status === 400 &&
                typeof error.response?.data?.message === "string"
                ? error.response.data.message
                : translate(
                    "Could not load the template preview. You can keep editing your form.",
                  ),
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 500);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [draft, renderTemplate, showSuccess, showError]);

  return (
    <WizardPreviewPane aria-label={translate("Live form preview")}>
      <div className="wizard-preview-header">
        <h3>{translate("Live preview")}</h3>
        <div className="wizard-preview-controls">
          <label className="wizard-preview-size">
            <span>{translate("Preview size")}</span>
            <div className="select wizard-select">
              <select
                value={size}
                onChange={(event) => setSize(event.target.value as typeof size)}
              >
                <option value="desktop">{translate("Desktop")}</option>
                <option value="tablet">{translate("Tablet")}</option>
                <option value="phone">{translate("Phone")}</option>
              </select>
            </div>
          </label>
          {!templateOnly && (
            <div className="wizard-preview-tabs">
              <button
                type="button"
                aria-pressed={!templateMode}
                onClick={() => setTemplateMode(false)}
              >
                {translate("Layout")}
              </button>
              <button
                type="button"
                aria-pressed={templateMode}
                disabled={!draft.fields.length || !draft.formattingTemplate}
                onClick={() => setTemplateMode(true)}
              >
                {translate("Template")}
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="wizard-preview-note">
        {translate(
          renderTemplate
            ? "Your selected formatting template. Submissions and uploads are disabled."
            : "A layout illustration. Your formatting template controls the finished appearance.",
        )}
      </p>
      <div className="wizard-preview-guidance">
        <InfoBlock>
          {translate(
            "After creating your form, you can customize it further in the builder with more field types, settings, and design options.",
          )}
        </InfoBlock>
      </div>
      <div className="wizard-preview-stage" ref={stage}>
        <div
          className="wizard-preview-canvas"
          data-preview-size={size}
          style={{
            width: canvasWidth,
            height: available.height / scale,
            transform: `scale(${scale})`,
            left: Math.max(0, (available.width - canvasWidth * scale) / 2),
          }}
        >
          {renderTemplate ? (
            <>
              {loading && (
                <p role="status" className="wizard-preview-status">
                  {translate("Updating preview…")}
                </p>
              )}
              {error && (
                <p role="status" className="wizard-preview-status">
                  {error}
                </p>
              )}
              {html && !error && (
                <iframe
                  title={translate("Form Preview")}
                  srcDoc={html}
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  style={{
                    opacity: loading ? 0.5 : 1,
                    pointerEvents: loading ? "none" : undefined,
                  }}
                />
              )}
            </>
          ) : (
            <div className="wizard-preview-paper">
              {showError && draft.errorMessage && (
                <div className="wizard-preview-error" role="status">
                  {draft.errorMessage}
                </div>
              )}
              {showSuccess && draft.successMessage && (
                <div className="wizard-preview-success" role="status">
                  ✓ {draft.successMessage}
                </div>
              )}
              <h4>{draft.name || translate("Your form")}</h4>
              {!draft.fields.length && (
                <p className="wizard-preview-note">
                  {translate(
                    "Choose a purpose to see your starting fields here.",
                  )}
                </p>
              )}
              {fieldRows(draft.fields).map((row) => (
                <div
                  className="wizard-preview-row"
                  key={row.map((field) => field.key).join("-")}
                >
                  {row.map((field) => (
                    <FieldPreview
                      key={field.key}
                      field={field}
                      showError={showError}
                    />
                  ))}
                </div>
              ))}
              {!!draft.fields.length && (
                <span className="wizard-preview-submit">
                  {translate("Submit")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </WizardPreviewPane>
  );
}
