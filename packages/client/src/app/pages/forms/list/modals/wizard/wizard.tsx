import { addSelectOptionIcons } from "@components/form-controls/control-types/select/select-option-icons";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { InfoBlock } from "@components/notification-blocks/info/info-block";
import config from "@config/freeform/freeform.config";
import { PortalProvider } from "@editor/builder/contexts/portal.context";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import { QKNotifications } from "@ff-client/queries/notifications";
import { generateHandle } from "@ff-client/utils/strings";
import translate from "@ff-client/utils/translations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizardBuilderScreen, WizardBuilder } from "./wizard.builder";
import { WizardFields } from "./wizard.fields";
import { useWizardHandoff } from "./wizard.handoff";
import { WizardIcon } from "./wizard.icon";
import { WizardLoading } from "./wizard.loading";
import { useWizardMorph } from "./wizard.morph";
import { WizardNotificationTemplate } from "./wizard.notification-template";
import { useWizardPosition } from "./wizard.position";
import { WizardPreview } from "./wizard.preview";
import { WizardPreviewNotice } from "./wizard.preview-notice";
import { WizardBody, WizardContainer } from "./wizard.styles";
import { WizardSelectPicker, WizardTemplatePicker } from "./wizard.template";
import { WizardToggle } from "./wizard.toggle";
import {
  type Choice,
  normalizeRows,
  type WizardDraft,
  type WizardOptions,
} from "./wizard.types";
import { wizardValidation } from "./wizard.validation";

function SelectChoices({
  choices,
  ...props
}: { choices: Choice[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="select fullwidth wizard-select">
      <select {...props}>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function WizardContent({
  options,
  closeModal: close,
}: { options: WizardOptions } & ModalContainerProps) {
  const closed = useRef(false);
  const closeModal = () => {
    if (closed.current) return;
    closed.current = true;
    close();
  };
  const { current, change, getCurrentHandleWithFallback } = useSiteContext();
  const siteId = current?.id ?? config.sites.current;
  const titleId = useId();
  const errorId = useId();
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const saving = useRef(false);
  const customHandle = useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<WizardDraft>(() => ({
    ...options.defaults,
    purpose: "",
    name: "",
    siteIds: [siteId],
    fields: [],
    adminEnabled: false,
    adminEmail: "",
    adminTemplate: "",
    adminNewTemplate: options.canCreateNotificationTemplates,
    confirmationEnabled: false,
    confirmationField: "",
    confirmationTemplate: "",
    confirmationNewTemplate: options.canCreateNotificationTemplates,
    requestToken: crypto.randomUUID(),
  }));
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [pendingPurpose, setPendingPurpose] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [cancelWizard, setCancelWizard] = useState(false);
  const [error, setError] = useState("");
  const [validationStep, setValidationStep] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [complete, setComplete] = useState<{ id: number; handle: string }>();
  const requestClose = () => {
    if (complete) closeModal();
    else {
      setCancelWizard(true);
      setConfirmDiscard(true);
    }
  };
  const [messageMode, setMessageMode] = useState<"success" | "error">(
    "success",
  );
  const [buildProgress, setBuildProgress] = useState<{
    count: number;
    total: number;
  }>();
  const [skipAnimation, setSkipAnimation] = useState(0);
  const [builderView, setBuilderView] = useState(true);
  const builderScreen = useWizardBuilderScreen();
  const builderActive = builderScreen && builderView && !complete && step !== 6;
  const builderBackdrop =
    builderScreen && (builderView || step === 6 || !!complete);
  const [showPreview, setShowPreview] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const placement = useWizardPosition(
    dialog,
    builderScreen && !complete,
    step === 6 && builderBackdrop
      ? "right-review"
      : builderActive
        ? "right"
        : "center",
  );
  useWizardMorph(dialog, `${step}-${builderActive}-${!!complete}`);
  const steps = [
    translate("Purpose"),
    translate("Details"),
    translate("Fields"),
    translate("Appearance"),
    translate("Behavior"),
    translate("Emails"),
    translate("Preview"),
  ];
  const allSitesSelected = config.sites.list.every((site) =>
    draft.siteIds.includes(site.id),
  );
  const preset = options.presets.find((preset) => preset.id === draft.purpose);
  const editable = (setting: string) =>
    options.editableSettings.includes(setting);
  const update = (changes: Partial<WizardDraft>) => {
    setDraft((draft) => ({
      ...draft,
      ...changes,
      ...("name" in changes && !customHandle.current
        ? {
            handle:
              generateHandle(changes.name ?? "", {
                camelize: true,
                transliterate: true,
              }) || "form",
          }
        : {}),
    }));
    setError("");
  };
  const choosePurpose = (purpose: string) => {
    const next = options.presets.find((preset) => preset.id === purpose)!;
    update({
      purpose,
      fields: normalizeRows(structuredClone(next.fields)),
      name:
        !draft.name || draft.name === preset?.label ? next.label : draft.name,
      description:
        editable("description") &&
        (!draft.description || draft.description === preset?.formDescription)
          ? (next.formDescription ?? "")
          : draft.description,
      confirmationField: "",
      confirmationEnabled: false,
    });
    setPendingPurpose("");
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Move focus when the displayed step or completion state changes.
  useEffect(() => {
    (
      pageHeading.current ??
      dialog.current?.querySelector<HTMLButtonElement>('[aria-current="step"]')
    )?.focus();
  }, [step, complete]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);
  const go = (next: number) => {
    setStep(next);
    setValidationStep(null);
    setFurthest((previous) => Math.max(previous, next));
    setError("");
    setShowPreview(false);
    if (next === 3 || next === 6)
      setTemplateMode(Boolean(draft.formattingTemplate));
  };
  const validation =
    validationStep === step
      ? wizardValidation(draft, step, options, config.sites.list)
      : undefined;
  const visibleError = validation?.message || error;
  const invalid = (key: string) => validation?.fields.has(key) ?? false;
  const advancedError = ["handle", "siteIds"].some(invalid);
  useEffect(() => {
    if (advancedError) setAdvancedOpen(true);
  }, [advancedError]);
  const errorProps = (key: string) => ({
    "aria-invalid": invalid(key) || undefined,
    "aria-errormessage": invalid(key) ? errorId : undefined,
  });
  const validate = (at: number) =>
    wizardValidation(draft, at, options, config.sites.list).message;
  const next = () => {
    const problem = validate(step);
    if (problem) setValidationStep(step);
    else go(step + 1);
  };
  const revisit = (target: number) => {
    for (let at = 0; at < target; at++) {
      const problem = validate(at);
      if (problem) {
        go(at);
        setValidationStep(at);
        return;
      }
    }
    go(target);
  };
  const create = async () => {
    if (saving.current) return;
    for (let at = 0; at < steps.length - 1; at++) {
      const problem = validate(at);
      if (problem) {
        go(at);
        setValidationStep(at);
        return;
      }
    }
    saving.current = true;
    setIsSaving(true);
    setError("");
    try {
      const { data } = await axios.post<{ id: number; handle: string }>(
        "/api/forms/wizard/create",
        draft,
      );
      void queryClient.invalidateQueries({
        queryKey: QKNotifications.templates(),
      });
      setComplete(data);
      const handles = new Set([
        getCurrentHandleWithFallback(),
        ...config.sites.list
          .filter((site) => draft.siteIds.includes(site.id))
          .map((site) => site.handle),
      ]);
      handles.forEach((handle) => {
        void queryClient.invalidateQueries({ queryKey: QKForms.all(handle) });
        void queryClient.invalidateQueries({ queryKey: QKGroups.all(handle) });
      });
    } catch (error) {
      setError(
        [400, 409].includes(error.response?.status) &&
          typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : translate(
              "Could not confirm that your form was created. Try again to check the same request.",
            ),
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };
  const navigateToForm = (path: string) => {
    const selected = config.sites.list.find((site) =>
      draft.siteIds.includes(site.id),
    );
    if (config.sites.enabled && selected && !draft.siteIds.includes(siteId)) {
      change(selected.handle);
      navigate(
        `${path}${path.includes("?") ? "&" : "?"}site=${encodeURIComponent(selected.handle)}`,
      );
    } else navigate(path);
  };
  const openForm = (path: string) => {
    navigateToForm(path);
    closeModal();
  };
  const handoff = useWizardHandoff(complete, navigateToForm, closeModal);
  const emailFields = draft.fields.flatMap((field, index) =>
    field.type === "email"
      ? [
          {
            value: field.key.startsWith("extra")
              ? `customField${index}`
              : field.key,
            label: field.label,
          },
        ]
      : [],
  );

  return (
    <>
      <WizardBuilder
        draft={draft}
        options={options}
        step={step}
        hidden={!builderBackdrop}
        revealing={!!complete && handoff === "revealing"}
        movement={`${placement.position.x},${placement.position.y}`}
        skipAnimation={skipAnimation}
        onAnimationProgress={setBuildProgress}
      />
      <WizardPreviewNotice
        dialog={dialog}
        enabled={builderBackdrop && !complete}
      />
      <WizardContainer
        data-builder-background={builderBackdrop}
        data-review={step === 6 && !complete}
        data-complete={!!complete}
        data-handoff={complete ? handoff : undefined}
        ref={dialog}
        style={{
          translate: `${placement.position.x}px ${placement.position.y}px`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (dialog.current?.querySelector(".wizard-template-picker.open"))
              return;
            event.stopPropagation();
            if (!saving.current) requestClose();
          }
          if (event.key === "Tab") {
            const selector =
              'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]';
            const nodes = [
              ...Array.from(
                dialog.current?.querySelectorAll<HTMLElement>(selector) ?? [],
              ),
              ...Array.from(
                document.querySelectorAll<HTMLElement>(
                  ".dropdown-rollout input, .dropdown-rollout button, .wizard-field-options textarea, .wizard-field-options button, .wizard-field-menu button",
                ),
              ),
            ].filter((element) => element.getClientRects().length > 0);
            const target = event.shiftKey ? nodes.at(-1) : nodes[0];
            if (
              (event.shiftKey && document.activeElement === nodes[0]) ||
              (!event.shiftKey && document.activeElement === nodes.at(-1)) ||
              document.activeElement === dialog.current
            ) {
              event.preventDefault();
              target?.focus();
            }
          }
        }}
      >
        <header>
          <div
            className="wizard-heading"
            data-movable={builderScreen && !complete}
            data-moving={placement.moving}
            onPointerDown={placement.onPointerDown}
            onPointerMove={placement.onPointerMove}
            onPointerUp={placement.onPointerUp}
            onPointerCancel={placement.onPointerUp}
            onLostPointerCapture={placement.onPointerUp}
          >
            <span className="wizard-heading-icon" aria-hidden="true">
              <WizardIcon kind="wizard" />
            </span>
            <div>
              <h1 id={titleId}>{translate("Guided form setup")}</h1>
            </div>
            {!complete && step !== 6 && (
              <button
                type="button"
                className="wizard-view-switch"
                aria-pressed={!builderView}
                onClick={() => setBuilderView(!builderView)}
              >
                {translate(
                  builderView
                    ? "Switch to Form Preview"
                    : "Switch to Builder View",
                )}
              </button>
            )}
            <button
              type="button"
              className="wizard-close"
              aria-label={translate("Close")}
              disabled={isSaving}
              onClick={requestClose}
            >
              ×
            </button>
          </div>
          {!complete && (
            <>
              <ol
                className="wizard-steps"
                aria-label={translate("Form setup steps")}
              >
                {steps.map((label, index) => (
                  <li key={label} data-reached={index <= step}>
                    <button
                      type="button"
                      aria-current={index === step ? "step" : undefined}
                      aria-label={label}
                      disabled={index > furthest || isSaving}
                      onClick={() =>
                        index <= step ? go(index) : revisit(index)
                      }
                    >
                      <span
                        className={`wizard-step-number ${index < step ? "wizard-step-done" : ""}`}
                      >
                        {index < step ? "✓" : index + 1}
                      </span>
                      <span className="wizard-step-label">{label}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div
                className="wizard-progress"
                role="progressbar"
                aria-label={translate("Form setup progress")}
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuenow={step + 1}
              >
                <span
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
            </>
          )}
        </header>
        {confirmDiscard && (
          <div className="wizard-error" role="alert">
            <p>
              {translate(
                cancelWizard
                  ? "Leave setup? Your changes will be lost."
                  : "Start over? Your changes will be lost.",
              )}
            </p>
            <div className="wizard-confirm-actions">
              <button
                type="button"
                className="btn submit"
                onClick={() => {
                  setDraft({
                    ...options.defaults,
                    purpose: "",
                    name: "",
                    siteIds: [siteId],
                    fields: [],
                    adminEnabled: false,
                    adminEmail: "",
                    adminTemplate: "",
                    adminNewTemplate: options.canCreateNotificationTemplates,
                    confirmationEnabled: false,
                    confirmationField: "",
                    confirmationTemplate: "",
                    confirmationNewTemplate:
                      options.canCreateNotificationTemplates,
                    requestToken: crypto.randomUUID(),
                  });
                  customHandle.current = false;
                  setAdvancedOpen(false);
                  setStep(0);
                  setFurthest(0);
                  setTemplateMode(false);
                  setMessageMode("success");
                  setPendingPurpose("");
                  setConfirmDiscard(false);
                  setError("");
                  setValidationStep(null);
                  if (cancelWizard) {
                    closeModal();
                  }
                  setCancelWizard(false);
                }}
              >
                {translate(cancelWizard ? "Leave setup" : "Start over")}
              </button>{" "}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setConfirmDiscard(false);
                  setCancelWizard(false);
                }}
              >
                {translate("Keep editing")}
              </button>
            </div>
          </div>
        )}
        {complete ? (
          <div className="wizard-complete">
            <div className="wizard-complete-mark" aria-hidden="true">
              ✓
            </div>
            <h2 ref={pageHeading} tabIndex={-1}>
              {translate("Your form is ready!")}
            </h2>
            <p role="status">
              {handoff !== "failed" && (
                <span className="wizard-opening-spinner" aria-hidden="true" />
              )}
              {translate(
                handoff === "failed"
                  ? "Your form was saved, but the builder is taking longer to open."
                  : "Opening your form in the builder…",
              )}
            </p>
            {handoff === "failed" && (
              <>
                <div className="wizard-complete-actions">
                  <button
                    type="button"
                    className="btn submit"
                    onClick={() => openForm(`/forms/${complete.id}`)}
                  >
                    {translate("Open form builder")}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openForm(`/forms/${complete.id}/preview`)}
                  >
                    {translate("Preview form")}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      openForm(`/forms/${complete.id}?wizardTour=1`)
                    }
                  >
                    {translate("Show me around")}
                  </button>
                </div>
                <div className="wizard-embed">
                  {translate(
                    "Add this to a Twig template to display your form:",
                  )}
                  <code>{`{{ craft.freeform.form('${complete.handle}').render() }}`}</code>
                  <p className="wizard-hint">
                    {translate(
                      "More embedding options are available in the form settings.",
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <WizardBody data-preview={showPreview} data-review={step === 6}>
            {(step !== 6 ||
              error ||
              (!draft.storeData && !draft.adminEnabled)) && (
              <div className="wizard-editor">
                <button
                  type="button"
                  className="btn wizard-preview-toggle"
                  aria-pressed={showPreview}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {translate(showPreview ? "Back to setup" : "Show preview")}
                </button>
                {visibleError && (
                  <div className="wizard-error" role="alert" id={errorId}>
                    {visibleError}
                  </div>
                )}
                <fieldset
                  key={step}
                  className="wizard-page"
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {step !== 6 && (
                    <h2 ref={pageHeading} tabIndex={-1}>
                      {
                        [
                          translate("What will your form be used for?"),
                          translate("Form details"),
                          translate("Choose your fields"),
                          translate("Form appearance"),
                          translate("Form behavior"),
                          translate("Email notifications"),
                        ][step]
                      }
                    </h2>
                  )}
                  {step !== 6 && (
                    <p
                      className={`wizard-intro${[2, 3, 5].includes(step) ? " wizard-banner-intro" : ""}`}
                    >
                      {
                        [
                          translate(
                            "Choose a starting point. We will suggest useful fields and layouts you can adjust.",
                          ),
                          translate(
                            "Set the form details and defaults for new submissions.",
                          ),
                          translate(
                            "Click names or icons to edit. Add with +, drag into rows of up to four, or move rows with outer handles.",
                          ),
                          translate(
                            "Choose a formatting template for your form.",
                          ),
                          translate(
                            "Set success and error messages, redirects, and submission storage.",
                          ),
                          translate(
                            "Configure team notifications and visitor confirmations. No emails are sent during setup.",
                          ),
                          translate(
                            "Review your choices. Everything can be adjusted later in the builder.",
                          ),
                        ][step]
                      }
                    </p>
                  )}
                  {step === 0 && (
                    <>
                      {buildProgress && (
                        <div className="wizard-build-progress">
                          <span role="status">
                            {translate(
                              "Adding starting fields… {count} of {total}",
                              buildProgress,
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSkipAnimation((value) => value + 1)
                            }
                          >
                            {translate("Skip animation")}
                          </button>
                        </div>
                      )}
                      {pendingPurpose && (
                        <div className="wizard-error" role="alert">
                          <p>
                            {translate(
                              "Changing the purpose replaces your current field choices. Your other settings will stay.",
                            )}
                          </p>
                          <button
                            className="btn"
                            type="button"
                            onClick={() => choosePurpose(pendingPurpose)}
                          >
                            {translate("Replace fields")}
                          </button>{" "}
                          <button
                            className="btn"
                            type="button"
                            onClick={() => setPendingPurpose("")}
                          >
                            {translate("Keep current fields")}
                          </button>
                        </div>
                      )}
                      <fieldset
                        className="wizard-purpose-grid"
                        aria-label={translate("Purpose")}
                        {...errorProps("purpose")}
                      >
                        {options.presets.map((item) => (
                          <button
                            className="wizard-purpose"
                            type="button"
                            key={item.id}
                            aria-pressed={draft.purpose === item.id}
                            onClick={() =>
                              draft.purpose && draft.purpose !== item.id
                                ? setPendingPurpose(item.id)
                                : !draft.purpose && choosePurpose(item.id)
                            }
                          >
                            <span
                              className="wizard-purpose-icon"
                              aria-hidden="true"
                            >
                              <WizardIcon kind={item.id} />
                            </span>
                            <strong>{item.label}</strong>
                            <small>{item.description}</small>
                          </button>
                        ))}
                      </fieldset>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <label className="wizard-field">
                        <span>{translate("Form Name")}</span>
                        <input
                          {...errorProps("name")}
                          value={draft.name}
                          maxLength={100}
                          onChange={(event) =>
                            update({ name: event.target.value })
                          }
                        />
                        <small>
                          {translate(
                            "This name helps you find the form in the control panel.",
                          )}
                        </small>
                      </label>
                      <label className="wizard-field">
                        <span>{translate("Form Description")}</span>
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={draft.description ?? ""}
                          disabled={!editable("description") || isSaving}
                          onChange={(event) =>
                            update({ description: event.target.value })
                          }
                        />
                      </label>
                      <div className="wizard-details-row">
                        <div className="wizard-field">
                          <span>{translate("Default Status")}</span>
                          <WizardSelectPicker
                            label={translate("Default Status")}
                            className="wizard-status-picker"
                            {...errorProps("defaultStatus")}
                            options={addSelectOptionIcons(
                              "defaultStatus",
                              options.statuses ?? [],
                            )}
                            value={draft.defaultStatus ?? ""}
                            disabled={!editable("defaultStatus") || isSaving}
                            onChange={(defaultStatus) =>
                              update({ defaultStatus })
                            }
                          />
                          <small>{translate("For new submissions.")}</small>
                        </div>
                        <div className="wizard-field">
                          <span id={`${titleId}-color`}>
                            {translate("Form Color")}
                          </span>
                          <div className="wizard-color-control">
                            <input
                              type="color"
                              aria-label={translate("Choose form color")}
                              value={
                                /^#[a-f\d]{6}$/i.test(draft.color ?? "")
                                  ? draft.color
                                  : "#3b82f6"
                              }
                              disabled={!editable("color") || isSaving}
                              onChange={(event) =>
                                update({ color: event.target.value })
                              }
                            />
                            <input
                              aria-labelledby={`${titleId}-color`}
                              {...errorProps("color")}
                              value={draft.color ?? ""}
                              maxLength={7}
                              spellCheck={false}
                              placeholder="#RRGGBB"
                              disabled={!editable("color") || isSaving}
                              onChange={(event) =>
                                update({ color: event.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <details
                        className="wizard-advanced"
                        open={advancedOpen}
                        onToggle={(event) =>
                          setAdvancedOpen(event.currentTarget.open)
                        }
                      >
                        <summary>{translate("Advanced")}</summary>
                        <div className="wizard-advanced-content">
                          <label className="wizard-field">
                            <span>{translate("Form Handle")}</span>
                            <input
                              {...errorProps("handle")}
                              value={draft.handle ?? ""}
                              maxLength={100}
                              spellCheck={false}
                              disabled={!editable("handle") || isSaving}
                              onChange={(event) => {
                                customHandle.current = Boolean(
                                  event.target.value.trim(),
                                );
                                update({ handle: event.target.value });
                              }}
                              onBlur={() => {
                                if (!draft.handle?.trim())
                                  update({
                                    handle:
                                      generateHandle(draft.name, {
                                        camelize: true,
                                        transliterate: true,
                                      }) || "form",
                                  });
                              }}
                            />
                            <small>
                              {translate(
                                "Generated from the name until customized.",
                              )}
                            </small>
                          </label>
                          {config.sites.enabled &&
                            config.sites.list.length > 1 && (
                              <fieldset
                                className="wizard-sites"
                                {...errorProps("siteIds")}
                              >
                                <legend>{translate("Sites")}</legend>
                                <p className="wizard-hint">
                                  {translate(
                                    "Select the sites where this form should be available.",
                                  )}
                                </p>
                                <button
                                  type="button"
                                  className="wizard-sites-select-all"
                                  onClick={() =>
                                    update({
                                      siteIds: allSitesSelected
                                        ? []
                                        : config.sites.list.map(
                                            (site) => site.id,
                                          ),
                                    })
                                  }
                                >
                                  {translate(
                                    allSitesSelected
                                      ? "Deselect All"
                                      : "Select All",
                                  )}
                                </button>
                                {config.sites.list.map((site) => (
                                  <label className="wizard-check" key={site.id}>
                                    <input
                                      type="checkbox"
                                      checked={draft.siteIds.includes(site.id)}
                                      onChange={(event) =>
                                        update({
                                          siteIds: event.target.checked
                                            ? [...draft.siteIds, site.id]
                                            : draft.siteIds.filter(
                                                (id) => id !== site.id,
                                              ),
                                        })
                                      }
                                    />
                                    {site.name}
                                  </label>
                                ))}
                              </fieldset>
                            )}
                        </div>
                      </details>
                    </>
                  )}
                  {step === 2 && (
                    <WizardFields
                      fields={draft.fields}
                      options={options}
                      invalidFields={validation?.fields}
                      errorId={errorId}
                      onChange={(fields) => {
                        const selected = draft.fields.find(
                          (field, index) =>
                            (field.key.startsWith("extra")
                              ? `customField${index}`
                              : field.key) === draft.confirmationField,
                        );
                        const nextIndex = fields.findIndex(
                          (field) =>
                            field.key === selected?.key &&
                            field.type === "email",
                        );
                        const confirmationField =
                          nextIndex < 0
                            ? ""
                            : fields[nextIndex].key.startsWith("extra")
                              ? `customField${nextIndex}`
                              : fields[nextIndex].key;
                        update({
                          fields,
                          confirmationField,
                          confirmationEnabled:
                            nextIndex < 0 ? false : draft.confirmationEnabled,
                        });
                      }}
                    />
                  )}
                  {step === 3 && (
                    <>
                      <div className="wizard-step-info">
                        <InfoBlock>
                          {translate(
                            "Your form will use the selected template when embedded on your site.",
                          )}
                        </InfoBlock>
                      </div>
                      <div className="wizard-field">
                        <span>{translate("Formatting Template")}</span>
                        <WizardTemplatePicker
                          value={draft.formattingTemplate}
                          groups={options.formattingTemplateGroups}
                          disabled={!editable("formattingTemplate") || isSaving}
                          onChange={(value) => {
                            update({ formattingTemplate: value });
                            setTemplateMode(Boolean(value));
                          }}
                        />
                        <small>
                          {translate(
                            "The template controls the appearance of your published form. Custom templates may depend on your site styles.",
                          )}
                        </small>
                      </div>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <label className="wizard-field">
                        <span>{translate("After submission")}</span>
                        <SelectChoices
                          disabled={!editable("successBehavior")}
                          onFocus={() => setMessageMode("success")}
                          value={draft.successBehavior}
                          choices={
                            options.successBehaviors ?? [
                              {
                                value: "reload",
                                label: translate("Show a success message"),
                              },
                              {
                                value: "redirect-return-url",
                                label: translate("Redirect to a page"),
                              },
                              ...(!["reload", "redirect-return-url"].includes(
                                draft.successBehavior,
                              )
                                ? [
                                    {
                                      value: draft.successBehavior,
                                      label: translate(
                                        "Use the configured default behavior",
                                      ),
                                    },
                                  ]
                                : []),
                            ]
                          }
                          onChange={(event) =>
                            update({ successBehavior: event.target.value })
                          }
                        />
                      </label>
                      {draft.successBehavior === "reload" && (
                        <label className="wizard-field">
                          <span>{translate("Success message")}</span>
                          <textarea
                            disabled={!editable("successMessage")}
                            value={draft.successMessage}
                            onFocus={() => setMessageMode("success")}
                            maxLength={2000}
                            onChange={(event) =>
                              update({ successMessage: event.target.value })
                            }
                            rows={2}
                          />
                        </label>
                      )}
                      {draft.successBehavior === "redirect-return-url" && (
                        <label className="wizard-field">
                          <span>{translate("Redirect URL")}</span>
                          <input
                            disabled={!editable("returnUrl")}
                            {...errorProps("returnUrl")}
                            value={draft.returnUrl}
                            onFocus={() => setMessageMode("success")}
                            onChange={(event) =>
                              update({ returnUrl: event.target.value })
                            }
                            placeholder="/thank-you"
                          />
                        </label>
                      )}
                      <label className="wizard-field">
                        <span>{translate("Error message")}</span>
                        <textarea
                          disabled={!editable("errorMessage")}
                          value={draft.errorMessage}
                          onFocus={() => setMessageMode("error")}
                          maxLength={2000}
                          rows={2}
                          onChange={(event) => {
                            setMessageMode("error");
                            update({ errorMessage: event.target.value });
                          }}
                        />
                        <small>
                          {translate(
                            "Shown when a submission has validation errors. Freeform handles field-specific errors automatically.",
                          )}
                        </small>
                      </label>
                      <WizardToggle
                        label={translate("Save submissions in Freeform")}
                        checked={draft.storeData}
                        disabled={!editable("storeData")}
                        onChange={(storeData) => update({ storeData })}
                        instructions={translate(
                          "When enabled, entries are available in Submissions. When disabled, configure an email notification or another destination before publishing.",
                        )}
                      />
                    </>
                  )}
                  {step === 5 &&
                    (!options.canNotify ||
                    (!options.notificationTemplates.length &&
                      !options.canCreateNotificationTemplates) ? (
                      <p>
                        {translate(
                          "Email notifications can be configured later in the builder once email templates and permissions are available.",
                        )}
                      </p>
                    ) : (
                      <>
                        <div className="wizard-step-info">
                          <InfoBlock>
                            {translate(
                              "New templates use your default sender settings and include the submitted fields. Review your templates in the builder before publishing.",
                            )}
                          </InfoBlock>
                        </div>
                        <WizardToggle
                          label={translate("Notify my team")}
                          checked={draft.adminEnabled}
                          disabled={false}
                          onChange={(adminEnabled) => update({ adminEnabled })}
                        />
                        {draft.adminEnabled && (
                          <>
                            <label className="wizard-field">
                              <span>{translate("Team email address")}</span>
                              <input
                                type="email"
                                {...errorProps("adminEmail")}
                                value={draft.adminEmail}
                                onChange={(event) =>
                                  update({ adminEmail: event.target.value })
                                }
                              />
                            </label>
                            <WizardNotificationTemplate
                              options={options}
                              create={draft.adminNewTemplate}
                              value={draft.adminTemplate}
                              label={translate("Team notification")}
                              invalid={invalid("adminTemplate")}
                              errorId={errorId}
                              onCreateChange={(adminNewTemplate) =>
                                update({ adminNewTemplate })
                              }
                              onValueChange={(adminTemplate) =>
                                update({ adminTemplate })
                              }
                            />
                          </>
                        )}
                        <WizardToggle
                          label={translate("Send the visitor a confirmation")}
                          checked={draft.confirmationEnabled}
                          disabled={
                            !emailFields.length && !draft.confirmationEnabled
                          }
                          onChange={(confirmationEnabled) =>
                            update({ confirmationEnabled })
                          }
                          instructions={
                            !emailFields.length
                              ? translate(
                                  "Add an Email field to send visitor confirmations.",
                                )
                              : undefined
                          }
                        />
                        {draft.confirmationEnabled && (
                          <>
                            <label className="wizard-field">
                              <span>{translate("Visitor email field")}</span>
                              <SelectChoices
                                choices={[
                                  {
                                    value: "",
                                    label: translate("Choose an Email field"),
                                  },
                                  ...emailFields,
                                ]}
                                {...errorProps("confirmationField")}
                                value={draft.confirmationField}
                                onChange={(event) =>
                                  update({
                                    confirmationField: event.target.value,
                                  })
                                }
                              />
                            </label>
                            <WizardNotificationTemplate
                              options={options}
                              create={draft.confirmationNewTemplate}
                              value={draft.confirmationTemplate}
                              label={translate("Visitor confirmation")}
                              invalid={invalid("confirmationTemplate")}
                              errorId={errorId}
                              onCreateChange={(confirmationNewTemplate) =>
                                update({ confirmationNewTemplate })
                              }
                              onValueChange={(confirmationTemplate) =>
                                update({ confirmationTemplate })
                              }
                            />
                          </>
                        )}
                      </>
                    ))}
                  {step === 6 && !draft.storeData && !draft.adminEnabled && (
                    <p className="wizard-error">
                      {translate(
                        "Submissions will not be saved and no team email is configured. Set up a destination before publishing.",
                      )}
                    </p>
                  )}
                </fieldset>
              </div>
            )}
            {!builderActive && (
              <WizardPreview
                draft={draft}
                showSuccess={
                  step === 4 &&
                  messageMode === "success" &&
                  draft.successBehavior === "reload"
                }
                showError={step === 4 && messageMode === "error"}
                templateMode={templateMode}
                setTemplateMode={setTemplateMode}
                templateOnly={step === 6}
              />
            )}
          </WizardBody>
        )}
        <footer>
          {complete ? (
            <button className="btn" type="button" onClick={closeModal}>
              {translate("Close")}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn wizard-footer-link"
                disabled={isSaving}
                onClick={() => {
                  setCancelWizard(false);
                  setConfirmDiscard(true);
                }}
              >
                {translate("Start over")}
              </button>
              <button
                type="button"
                className="btn wizard-footer-link"
                disabled={isSaving}
                onClick={requestClose}
              >
                {translate("Cancel")}
              </button>
              <span className="wizard-footer-note">
                {translate("Step {step} of {count}", {
                  step: step + 1,
                  count: steps.length,
                })}
              </span>
              {step > 0 && (
                <button
                  type="button"
                  className="btn"
                  disabled={isSaving}
                  onClick={() => go(step - 1)}
                >
                  ← {translate("Back")}
                </button>
              )}
              <button
                type="button"
                className="btn submit"
                aria-busy={isSaving}
                disabled={isSaving || !!pendingPurpose}
                onClick={step === 6 ? create : next}
              >
                {isSaving && (
                  <span className="wizard-saving-spinner" aria-hidden="true" />
                )}
                {translate(
                  isSaving
                    ? "Creating form…"
                    : step === 6
                      ? "Create form"
                      : "Continue",
                )}
                {!isSaving && step < 6 && " →"}
              </button>
            </>
          )}
        </footer>
      </WizardContainer>
    </>
  );
}

export function FormWizardModal({ closeModal }: ModalContainerProps) {
  const { data, isLoading, isError, refetch } = useQuery<WizardOptions>({
    queryKey: ["form-wizard-options"],
    queryFn: () =>
      axios.get<WizardOptions>("/api/forms/wizard").then(({ data }) => data),
    staleTime: 0,
  });
  if (!data || isLoading || isError)
    return (
      <WizardLoading
        closeModal={closeModal}
        isError={isError}
        onRetry={() => void refetch()}
      />
    );
  return (
    <PortalProvider>
      <WizardContent options={data} closeModal={closeModal} />
    </PortalProvider>
  );
}
