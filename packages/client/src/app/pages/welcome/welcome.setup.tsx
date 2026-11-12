import {
  type ChoiceCardOption,
  ChoiceCards,
} from "@components/elements/choice-cards/choice-cards";
import { NumberInput } from "@components/elements/number-input/number-input";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import axios from "axios";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { permissionPresets } from "../limited-users/limited-users.presets";
import {
  changedSetupValues,
  type SetupClient,
  type SetupKey,
  type SetupOptions,
  type SetupProfileLevel,
  type SetupResources,
  type SetupValues,
  setupClient,
} from "./welcome.setup.api";
import {
  DigestSchedule,
  SetupSelect,
  SetupSwitch,
  WorkflowIcon,
} from "./welcome.setup.controls";
import { useSetupExit } from "./welcome.setup.exit";
import {
  initialAnswers,
  type Recommendation,
  recommendationsFor,
  type SetupAnswers,
} from "./welcome.setup.recommendations";

const steps = ["Your workflow", "Your needs", "Suggested setup", "Review"];
const scopes = [
  "Site setting",
  "New form default",
  "New field default",
  "New email template default",
] as const;
const scopeHeadings: Record<Recommendation["scope"], string> = {
  "Site setting": "Site Settings",
  "New form default": "New Forms",
  "New field default": "New Fields",
  "New email template default": "New Email Templates",
};
const option = (
  value: string,
  label: string,
  instructions: string,
): ChoiceCardOption => ({
  value,
  label: translate(label),
  instructions: translate(instructions),
});
const workflowQuestions = [
  {
    key: "maintainer",
    label: "Who will build and maintain forms?",
    options: [
      [
        "developers",
        "Developers",
        "Forms and templates are maintained by people comfortable with code.",
      ],
      [
        "editors",
        "Clients or editors",
        "Keep everyday form editing approachable and protect technical settings.",
      ],
      [
        "both",
        "A mix of both",
        "Developers establish the setup and editors maintain the content.",
      ],
    ],
  },
  {
    key: "rendering",
    label: "How will you build the form front end?",
    options: [
      [
        "samples",
        "Starter templates",
        "Start with the included formatting templates, then customize the markup and styling.",
      ],
      [
        "custom",
        "Custom Twig",
        "Your project will provide its own form markup and styling.",
      ],
      [
        "headless",
        "Headless",
        "A separate front end will display and submit your forms.",
      ],
      [
        "mixed",
        "Mixed or undecided",
        "Keep your options open while you explore Freeform.",
      ],
    ],
  },
  {
    key: "scale",
    label: "What kind of forms are you planning?",
    options: [
      [
        "basic",
        "A few basic forms",
        "Contact forms and other straightforward enquiries.",
      ],
      [
        "growing",
        "Several different forms",
        "A range of forms with different fields, emails, and destinations.",
      ],
      [
        "advanced",
        "Complex workflows",
        "Longer forms, conditional behavior, and connected services.",
      ],
    ],
  },
] as const;
const needs = [
  ["review", "Review submissions in Craft"],
  ["emails", "Send notification emails"],
  ["external", "Connect external services"],
  ["uploads", "Accept file uploads"],
  ["ai", "Build forms with AI"],
  ["aiProcessing", "Process responses with AI"],
  ["reliability", "Receive alerts about problems"],
];
const buildingPresets = permissionPresets.filter(
  ({ id }) => id === "simplified-building" || id === "advanced-building",
);
type Props = {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  backLabel?: string;
  hideAllSettings?: boolean;
  client?: SetupClient;
  onSaved?: (redirect: string) => void;
};

export const SetupGuide = ({
  headingRef,
  onBack,
  backLabel = "Back to welcome",
  hideAllSettings = false,
  client = setupClient,
  onSaved = (redirect) => window.location.assign(redirect),
}: Props) => {
  const [options, setOptions] = useState<SetupOptions>();
  const [answers, setAnswers] = useState<SetupAnswers>(initialAnswers);
  const [edits, setEdits] = useState<Partial<SetupValues>>({});
  const [selected, setSelected] = useState<Partial<Record<SetupKey, boolean>>>(
    {},
  );
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedRedirect, setSavedRedirect] = useState<string>();
  const [createProfile, setCreateProfile] = useState(false);
  const [profileName, setProfileName] = useState(translate("Form editors"));
  const [profileLevel, setProfileLevel] = useState<SetupProfileLevel>(
    "simplified-building",
  );
  const [createTemplates, setCreateTemplates] = useState(false);
  const [teamName, setTeamName] = useState(translate("Team notification"));
  const [visitorName, setVisitorName] = useState(
    translate("Visitor confirmation"),
  );
  const requestId = useRef(uuid());
  const saveRequest = useRef<AbortController | undefined>(undefined);
  const leaveAllowed = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Focus each committed step without a delayed callback that could steal error focus.
  useEffect(() => {
    title.current?.focus();
  }, [step]);
  useEffect(() => {
    if (error) errorSummary.current?.focus();
  }, [error]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: The attempt counter explicitly retries a failed load.
  useEffect(() => {
    const request = new AbortController();
    setOptions(undefined);
    setError("");
    setConflict(false);
    client
      .load(request.signal)
      .then((data) => {
        if (!request.signal.aborted) {
          setOptions(data);
          setEdits({});
          setSelected({});
          setCreateProfile(false);
          setCreateTemplates(false);
          requestId.current = uuid();
        }
      })
      .catch(() => {
        if (!request.signal.aborted)
          setError(
            translate(
              "The setup guide could not load your settings. Try again.",
            ),
          );
      });
    return () => request.abort();
  }, [client, attempt]);
  useEffect(() => () => saveRequest.current?.abort(), []);
  const recommendations = useMemo(
    () => (options ? recommendationsFor(answers, options) : []),
    [answers, options],
  );
  const disabled = (key?: SetupKey) =>
    saving || !options?.canSave || (!!key && options.locked.includes(key));
  const chosen = (item: Recommendation) =>
    !options?.locked.includes(item.key) &&
    (selected[item.key] ?? !item.optional);
  const valueFor = (item: Recommendation) => edits[item.key] ?? item.value;
  const draft = { ...options?.values } as SetupValues;
  for (const item of recommendations) {
    if (chosen(item)) draft[item.key] = valueFor(item);
  }
  // These dependent settings are meaningful only for the active logging style.
  if (draft.loggingStyle !== "activity" && options)
    draft.activityMode = options.values.activityMode;
  if (draft.loggingStyle !== "classic" && options)
    draft.loggingLevel = options.values.loggingLevel;
  if (options && draft.emailTemplateMethod === "form") {
    draft.emailTemplateStorageType = options.values.emailTemplateStorageType;
    draft.emailTemplateDefault = options.values.emailTemplateDefault;
  } else if (options && draft.emailTemplateStorageType !== "files_database") {
    draft.emailTemplateDefault = options.values.emailTemplateDefault;
  }
  const sharedTemplatesAvailable =
    options?.canCreateTemplates &&
    draft.emailTemplateMethod !== "form" &&
    draft.emailTemplateStorageType !== "files";
  const profileAvailable = ["editors", "both"].includes(answers.maintainer);
  const resources: SetupResources = {
    requestId: requestId.current,
    ...(profileAvailable && createProfile
      ? {
          profile: {
            name: profileName,
            level: profileLevel,
            uploads: answers.needs.includes("uploads"),
          },
        }
      : {}),
    ...(sharedTemplatesAvailable && createTemplates
      ? {
          templates: { team: teamName, visitor: visitorName },
          templateDefaults: options.notificationDefaults ?? {
            admin: "",
            emailField: "",
          },
        }
      : {}),
  };
  const hasResources = !!resources.profile || !!resources.templates;
  const changes = options ? changedSetupValues(options.values, draft) : {};
  const changedKeys = Object.keys(changes) as SetupKey[];
  const recipientNeeded = (item: Recommendation) =>
    !!options?.canSave &&
    ["alertNotificationRecipients", "errorNotificationRecipients"].includes(
      item.key,
    ) &&
    chosen(item) &&
    !valueFor(item).trim() &&
    !options?.values[item.key]?.trim();
  const missingRecipients = recommendations.filter(recipientNeeded);
  const dirty =
    JSON.stringify(answers) !== JSON.stringify(initialAnswers) ||
    Object.keys(edits).length > 0 ||
    hasResources;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!leaveAllowed.current && (dirty || saving)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);
  const requestExit = useSetupExit({ dirty, saving, leaveAllowed });
  const back = () => requestExit(onBack);
  const go = (next: number) => {
    if (next > 0 && !workflowComplete) return;
    if (next === 3 && missingRecipients.length) {
      setError(
        translate(
          "Enter alert recipients or turn off those suggestions to continue.",
        ),
      );
      return;
    }
    setStep(next);
  };
  const answer = (key: keyof Omit<SetupAnswers, "needs">, value: string) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setError("");
  };
  const display = (key: SetupKey, value: string) => {
    const item = recommendations.find((item) => item.key === key);
    const label = item?.options?.find(
      (option) => option.value === value,
    )?.label;
    if (key === "defaultUploadCount")
      return translate(value === "1" ? "1 file" : "{count} files", {
        count: value,
      });
    if (key === "defaultUploadSize")
      return translate("{size} KB", { size: value });
    return label ? translate(label) : value || translate("Not set");
  };
  const save = async () => {
    if (!options?.canSave || saving) return;
    if (missingRecipients.length) {
      setError(
        translate(
          "Enter alert recipients or turn off those suggestions to continue.",
        ),
      );
      return;
    }
    setSaving(true);
    setError("");
    setConflict(false);
    const request = new AbortController();
    saveRequest.current = request;
    try {
      const result = await client.save(
        changes,
        options.values,
        request.signal,
        hasResources ? resources : undefined,
      );
      if (!request.signal.aborted) {
        leaveAllowed.current = true;
        setSaving(false);
        setSavedRedirect(result.redirect);
        go(4);
      }
    } catch (failure) {
      if (!request.signal.aborted) {
        const status = axios.isAxiosError(failure)
          ? failure.response?.status
          : undefined;
        const message = axios.isAxiosError(failure)
          ? failure.response?.data?.message
          : undefined;
        setConflict(status === 409);
        const fieldErrors = axios.isAxiosError(failure)
          ? failure.response?.data?.errors
          : undefined;
        const detail =
          fieldErrors && typeof fieldErrors === "object"
            ? Object.values(fieldErrors)
                .flat()
                .find((value): value is string => typeof value === "string")
            : undefined;
        setError(
          [
            message ||
              translate(
                "Settings could not be saved. Your choices are still here. Review them and try again.",
              ),
            detail,
          ]
            .filter(Boolean)
            .join(" "),
        );
        setSaving(false);
      }
    }
  };
  const workflowComplete =
    !!answers.maintainer && !!answers.rendering && !!answers.scale;
  const question = (
    key: keyof Omit<SetupAnswers, "needs">,
    label: string,
    choices: readonly (readonly string[])[],
    instructions?: string,
  ) => (
    <div className="setup-field" key={key}>
      <h4>{translate(label)}</h4>
      {instructions && <p className="setup-note">{translate(instructions)}</p>}
      <ChoiceCards
        label={translate(label)}
        value={answers[key]}
        options={choices.map(([value, label, description]) => ({
          ...option(value, label, description),
          icon: step === 0 ? <WorkflowIcon value={value} /> : undefined,
        }))}
        disabled={saving}
        onChange={(value) => answer(key, value)}
      />
    </div>
  );
  const setting = (item: Recommendation) => {
    const boolean =
      item.options?.length === 2 &&
      item.options.every((option) => ["true", "false"].includes(option.value));
    const active = chosen(item);
    const showRecommendation =
      !item.preserved &&
      !["defaultFormattingTemplate", "defaultUploadSource"].includes(item.key);
    const effectiveValue = active
      ? valueFor(item)
      : options?.values[item.key] || "";
    const savedValue = options?.values[item.key] || "";
    const booleanChanged = boolean && effectiveValue !== savedValue;
    const update = (value: string) => {
      setEdits((previous) => ({ ...previous, [item.key]: value }));
      setSelected((previous) => ({ ...previous, [item.key]: true }));
    };
    return (
      <div
        className="setup-suggestion"
        key={item.key}
        data-disabled={options?.locked.includes(item.key)}
      >
        <div className="setup-selection">
          <SetupSwitch
            id={`setup-${item.key}`}
            label={translate(boolean ? item.label : "Include {setting}", {
              setting: translate(item.label),
            })}
            checked={boolean ? effectiveValue === "true" : active}
            disabled={disabled(item.key)}
            onChange={(enabled) =>
              boolean
                ? update(String(enabled))
                : setSelected((previous) => ({
                    ...previous,
                    [item.key]: enabled,
                  }))
            }
          />
          <label htmlFor={`setup-${item.key}`}>
            <strong>{translate(item.label)}</strong>
            <small>{translate(item.reason)}</small>
          </label>
        </div>
        <div className="setup-suggestion-control">
          {boolean ? (
            <>
              <span className="setup-value" data-changed={booleanChanged}>
                {booleanChanged ? (
                  <>
                    <span>{display(item.key, savedValue)}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-label={translate("Changes to")}
                      role="img"
                    >
                      <path d="M4 12h15m-6-6 6 6-6 6" />
                    </svg>
                    <strong>{display(item.key, effectiveValue)}</strong>
                  </>
                ) : (
                  translate(
                    effectiveValue === "true"
                      ? "Already enabled"
                      : "Already disabled",
                  )
                )}
              </span>
              {active && effectiveValue !== options?.values[item.key] && (
                <button
                  type="button"
                  className="setup-reset"
                  disabled={disabled(item.key)}
                  onClick={() =>
                    setSelected((previous) => ({
                      ...previous,
                      [item.key]: false,
                    }))
                  }
                >
                  {translate("Undo change")}
                </button>
              )}
            </>
          ) : (
            active &&
            (item.key === "clientDigestFrequency" ? (
              <DigestSchedule
                label={translate(item.label)}
                value={valueFor(item)}
                disabled={disabled(item.key)}
                onChange={update}
              />
            ) : item.options ? (
              <SetupSelect
                label={translate(item.label)}
                formatting={item.key === "defaultFormattingTemplate"}
                recommendedValue={showRecommendation ? item.value : undefined}
                value={valueFor(item)}
                disabled={disabled(item.key)}
                options={item.options}
                onChange={update}
              />
            ) : item.type === "number" ? (
              <NumberInput
                className="text fullwidth"
                aria-label={translate(item.label)}
                min={1}
                unit={
                  item.key === "defaultUploadSize"
                    ? "KB"
                    : valueFor(item) === "1"
                      ? "file"
                      : "files"
                }
                value={valueFor(item)}
                disabled={disabled(item.key)}
                onChange={(event) => update(event.target.value)}
              />
            ) : (
              <input
                className="text fullwidth"
                aria-label={translate(item.label)}
                type={item.type || "text"}
                maxLength={500}
                placeholder={
                  [
                    "alertNotificationRecipients",
                    "errorNotificationRecipients",
                    "clientDigestRecipients",
                  ].includes(item.key)
                    ? "name@example.com, team@example.com"
                    : undefined
                }
                aria-required={recipientNeeded(item) || undefined}
                aria-describedby={
                  recipientNeeded(item) ? `setup-${item.key}-help` : undefined
                }
                value={valueFor(item)}
                disabled={disabled(item.key)}
                onChange={(event) => update(event.target.value)}
              />
            ))
          )}
          {active && recipientNeeded(item) && (
            <small
              className="setup-recipient-needed"
              id={`setup-${item.key}-help`}
            >
              {translate(
                "Enter at least one recipient to enable these alerts, or turn off this suggestion.",
              )}
            </small>
          )}
          {!boolean &&
            active &&
            showRecommendation &&
            item.options &&
            valueFor(item) !== item.value && (
              <small className="setup-recommended-value">
                {translate("Recommended for this setup: {value}", {
                  value: display(item.key, item.value),
                })}
              </small>
            )}
          {!boolean && (
            <small>
              {translate("Currently saved:")}{" "}
              {display(item.key, options?.values[item.key] || "")}
            </small>
          )}
          {options?.locked.includes(item.key) && (
            <small>
              {translate(
                "This setting is managed in your project configuration.",
              )}
            </small>
          )}
        </div>
      </div>
    );
  };
  const nextStepLink = (href: string, text: string) =>
    savedRedirect ? (
      <a href={href}>{translate(text)}</a>
    ) : (
      <span>{translate(text)}</span>
    );

  return (
    <section className="setup-guide" aria-labelledby="setup-guide-title">
      <div className="edition-toolbar">
        <button
          type="button"
          className="edition-back"
          disabled={saving}
          onClick={back}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
          {translate(backLabel)}
        </button>
        {!hideAllSettings && (
          <a href={generateUrl("settings/general")}>
            {translate("All settings")}
          </a>
        )}
      </div>
      <header className="setup-heading">
        <h2 ref={headingRef} tabIndex={-1} id="setup-guide-title">
          {translate("Set up for your workflow")}
        </h2>
        <p>
          {translate(
            "Tell us how you plan to use Freeform. Review a suggested setup and adjust anything before applying it.",
          )}
        </p>
      </header>
      <ol className="setup-steps" aria-label={translate("Setup progress")}>
        {steps.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              aria-current={step === index ? "step" : undefined}
              data-complete={index < step}
              disabled={
                saving ||
                !!savedRedirect ||
                !options ||
                (index > 0 && !workflowComplete)
              }
              onClick={() => go(index)}
            >
              <span aria-hidden="true">
                {index < step ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 10 3 3 7-7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              {translate(label)}
            </button>
          </li>
        ))}
      </ol>
      {error && (
        <div
          className="setup-error"
          role="alert"
          tabIndex={-1}
          ref={errorSummary}
        >
          <p>{error}</p>
          {!options && (
            <button
              type="button"
              className="btn"
              onClick={() => setAttempt((n) => n + 1)}
            >
              {translate("Try again")}
            </button>
          )}
          {conflict && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (
                  window.confirm(
                    translate(
                      "Reload the current settings and discard these unsaved choices?",
                    ),
                  )
                )
                  setAttempt((n) => n + 1);
              }}
            >
              {translate("Reload settings")}
            </button>
          )}
        </div>
      )}
      {!options && !error && (
        <p role="status">{translate("Loading your current settings…")}</p>
      )}
      {options && !options.canSave && (
        <p className="setup-readonly" role="status">
          {translate(
            "Settings are read-only in this environment. You can explore this guide, but changes cannot be saved here.",
          )}
        </p>
      )}
      {options && (
        <>
          <div className="setup-step" key={step}>
            <h3 className="setup-step-title" tabIndex={-1} ref={title}>
              {translate(step === 4 ? "Your setup is saved" : steps[step])}
            </h3>
            {step === 0 && (
              <>
                <p className="setup-intro">
                  {translate(
                    "These answers tailor the suggestions. They do not change any settings yet.",
                  )}
                </p>
                {workflowQuestions.map((item) =>
                  question(item.key, item.label, item.options),
                )}
              </>
            )}
            {step === 1 && (
              <>
                {question(
                  "reuse",
                  "How will you manage email notification templates?",
                  [
                    [
                      "shared",
                      "Shared templates",
                      "Reuse notification designs across forms.",
                    ],
                    [
                      "individual",
                      "Form-specific templates",
                      "Keep notification templates with each form.",
                    ],
                    [
                      "mixed",
                      "Both options",
                      "Make shared and form-specific templates available.",
                    ],
                  ],
                  "Email templates define the content and layout of notifications. Email delivery uses the mail settings in Craft.",
                )}
                <fieldset className="setup-needs">
                  <legend>{translate("What else will you need?")}</legend>
                  <p className="setup-note">
                    {translate(
                      "Choose any that apply. You can skip this and add features later.",
                    )}
                  </p>
                  <div>
                    {needs
                      .filter(
                        ([key]) =>
                          !["ai", "aiProcessing"].includes(key) ||
                          options.canUseAi,
                      )
                      .map(([key, label]) => (
                        <label key={key}>
                          <SetupSwitch
                            label={translate(label)}
                            checked={answers.needs.includes(key)}
                            disabled={saving}
                            onChange={(enabled) =>
                              setAnswers((previous) => ({
                                ...previous,
                                needs: enabled
                                  ? [...previous.needs, key]
                                  : previous.needs.filter(
                                      (need) => need !== key,
                                    ),
                              }))
                            }
                          />
                          {translate(label)}
                        </label>
                      ))}
                    {options.canUseAb && (
                      <label>
                        <SetupSwitch
                          label={translate("Show A/B Testing in navigation")}
                          checked={
                            (answers.abTests || options.values.abTests) ===
                            "true"
                          }
                          disabled={
                            saving || options.locked.includes("abTests")
                          }
                          onChange={(enabled) =>
                            answer("abTests", String(enabled))
                          }
                        />
                        {translate("Show A/B Testing in navigation")}
                      </label>
                    )}
                  </div>
                </fieldset>
                {answers.needs.includes("uploads") &&
                  question("uploadKind", "What files will visitors upload?", [
                    [
                      "image",
                      "Images",
                      "Photos and other supported image files.",
                    ],
                    [
                      "pdf",
                      "PDF documents",
                      "Documents supplied as PDF files.",
                    ],
                    [
                      "image,pdf",
                      "Images and PDFs",
                      "Allow both on new upload fields.",
                    ],
                  ])}
                {answers.needs.some((need) =>
                  ["emails", "external", "aiProcessing"].includes(need),
                ) &&
                  question(
                    "queue",
                    "Is automatic background processing set up?",
                    [
                      [
                        "ready",
                        "Yes, it is set up",
                        "A worker, cron job, or ping service processes the queue without control panel visits.",
                      ],
                      [
                        "help",
                        "No, show setup options",
                        "Show the queue settings and Form Monitor options.",
                      ],
                      [
                        "unsure",
                        "I’m not sure",
                        "Keep processing as it is until a runner is configured.",
                      ],
                    ],
                    "Emails, integrations, and AI tasks can run in the background. This needs a queue worker, cron job, or ping service, which Freeform cannot reliably detect.",
                  )}
              </>
            )}
            {step === 2 && (
              <>
                <p className="setup-intro">
                  {translate(
                    "Adjust the suggested settings below. Turn off a suggestion to keep its saved value. On/off settings use a single toggle for their proposed value.",
                  )}
                </p>
                {scopes.map((scope) => {
                  const items = recommendations.filter(
                    (item) =>
                      item.scope === scope &&
                      (item.key !== "activityMode" ||
                        draft.loggingStyle === "activity") &&
                      (item.key !== "loggingLevel" ||
                        draft.loggingStyle === "classic") &&
                      (item.key !== "emailTemplateStorageType" ||
                        draft.emailTemplateMethod !== "form") &&
                      (item.key !== "emailTemplateDefault" ||
                        (draft.emailTemplateMethod !== "form" &&
                          draft.emailTemplateStorageType === "files_database")),
                  );
                  return (
                    items.length > 0 && (
                      <section className="setup-suggestion-group" key={scope}>
                        <h4>{translate(scopeHeadings[scope])}</h4>
                        {scope === "New field default" &&
                          answers.needs.includes("uploads") &&
                          !options.catalog?.defaultUploadSource?.length && (
                            <p className="setup-note setup-recipient-needed">
                              {translate(
                                "No upload volumes are available. Set up an asset volume and allow it in Freeform settings after finishing this guide.",
                              )}
                            </p>
                          )}
                        {items.map(setting)}
                      </section>
                    )
                  );
                })}
                <section className="setup-suggestion-group">
                  <h4>{translate("Optional Setup")}</h4>
                  <p className="setup-note">
                    {translate(
                      "Optional resources are created only when you apply this setup. Existing resources are never replaced.",
                    )}
                  </p>
                  {profileAvailable && (
                    <div className="setup-resource">
                      <div className="setup-selection">
                        <SetupSwitch
                          id="setup-create-profile"
                          label={translate("Create a Limited Users profile")}
                          checked={createProfile}
                          disabled={disabled()}
                          onChange={(enabled) => {
                            setCreateProfile(enabled);
                            if (enabled)
                              setProfileLevel(
                                answers.scale === "basic"
                                  ? "simplified-building"
                                  : "advanced-building",
                              );
                          }}
                        />
                        <label htmlFor="setup-create-profile">
                          <strong>
                            {translate("Create a Limited Users profile")}
                          </strong>
                          <small>
                            {translate(
                              "Prepare a simpler editing experience. No users or groups are assigned automatically.",
                            )}
                          </small>
                        </label>
                      </div>
                      {createProfile && (
                        <div className="setup-resource-fields">
                          <label>
                            {translate("Profile name")}
                            <input
                              className="text fullwidth"
                              value={profileName}
                              maxLength={100}
                              disabled={disabled()}
                              onChange={(event) =>
                                setProfileName(event.target.value)
                              }
                            />
                            <small className="setup-note">
                              {translate(
                                "A number is added if this name is already in use.",
                              )}
                            </small>
                          </label>
                          <label>
                            {translate("Editing access")}
                            <SetupSelect
                              label={translate("Editing access")}
                              value={profileLevel}
                              disabled={disabled()}
                              onChange={(value) =>
                                setProfileLevel(value as SetupProfileLevel)
                              }
                              options={buildingPresets.map(({ id, label }) => ({
                                value: id,
                                label,
                              }))}
                            />
                          </label>
                          <p className="setup-note">
                            {translate(
                              buildingPresets.find(
                                ({ id }) => id === profileLevel,
                              )!.description,
                            )}
                            {profileLevel === "simplified-building" &&
                              answers.needs.includes("uploads") &&
                              ` ${translate("Selected upload fields are also available.")}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {sharedTemplatesAvailable && (
                    <div className="setup-resource">
                      <div className="setup-selection">
                        <SetupSwitch
                          id="setup-create-templates"
                          label={translate("Create starter email templates")}
                          checked={createTemplates}
                          disabled={disabled()}
                          onChange={setCreateTemplates}
                        />
                        <label htmlFor="setup-create-templates">
                          <strong>
                            {translate("Create starter email templates")}
                          </strong>
                          <small>
                            {translate(
                              "Create team notification and visitor confirmation templates in the database and use them as defaults for new notifications. Recipients are still configured on each form.",
                            )}
                          </small>
                        </label>
                      </div>
                      {sharedTemplatesAvailable && createTemplates && (
                        <div className="setup-inputs setup-resource-fields">
                          <label>
                            {translate("Team template name")}
                            <input
                              className="text fullwidth"
                              value={teamName}
                              maxLength={100}
                              disabled={disabled()}
                              onChange={(event) =>
                                setTeamName(event.target.value)
                              }
                            />
                            <small className="setup-note">
                              {translate(
                                "A number is added if this name is already in use.",
                              )}
                            </small>
                          </label>
                          <label>
                            {translate("Visitor template name")}
                            <input
                              className="text fullwidth"
                              value={visitorName}
                              maxLength={100}
                              disabled={disabled()}
                              onChange={(event) =>
                                setVisitorName(event.target.value)
                              }
                            />
                            <small className="setup-note">
                              {translate(
                                "A number is added if this name is already in use.",
                              )}
                            </small>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                  {!profileAvailable && !sharedTemplatesAvailable && (
                    <p className="setup-note">
                      {translate(
                        "No starter resources are suggested for these answers and permissions.",
                      )}
                    </p>
                  )}
                </section>
              </>
            )}
            {step === 3 && (
              <>
                <div className="setup-review-notice" role="note">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v6m0-10v1" />
                  </svg>
                  <p>
                    {translate(
                      "Only the changes listed below will be applied. New form and field defaults apply to future forms and fields. Existing forms keep their settings.",
                    )}
                  </p>
                </div>
                {changedKeys.length ? (
                  <dl className="setup-review">
                    {changedKeys.map((key) => (
                      <div key={key}>
                        <dt>
                          {translate(
                            recommendations.find((item) => item.key === key)
                              ?.label || key,
                          )}
                          {recommendations.find((item) => item.key === key)
                            ?.scope !== "Site setting" && (
                            <small>
                              {translate(
                                recommendations.find((item) => item.key === key)
                                  ?.scope || "Site setting",
                              )}
                            </small>
                          )}
                        </dt>
                        <dd>
                          <span>{display(key, options.values[key])}</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-label={translate("Changes to")}
                            role="img"
                          >
                            <path d="M4 12h15m-6-6 6 6-6 6" />
                          </svg>
                          <strong>{display(key, draft[key])}</strong>
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="setup-note">
                    {translate("Your current settings will be kept.")}
                  </p>
                )}
                {resources.profile && (
                  <div className="setup-review-resource">
                    <h4>{translate("New Limited Users profile")}</h4>
                    <div className="setup-resource-names">
                      <span>{profileName}</span>
                    </div>
                    <p>
                      {translate(
                        buildingPresets.find(({ id }) => id === profileLevel)!
                          .description,
                      )}
                      {profileLevel === "simplified-building" &&
                        answers.needs.includes("uploads") &&
                        ` ${translate("Selected upload fields are also available.")}`}
                    </p>
                    <p className="setup-note">
                      {translate(
                        "After setup, assign this profile through Craft user permissions when ready.",
                      )}
                    </p>
                  </div>
                )}
                {resources.templates && (
                  <div className="setup-review-resource">
                    <h4>{translate("New shared email templates")}</h4>
                    <div className="setup-resource-names">
                      <span>{teamName}</span>
                      <span>{visitorName}</span>
                    </div>
                    <p className="setup-note">
                      {translate(
                        "These become defaults for new admin and email-field notifications. No notification recipients are added and no emails are sent by this guide.",
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
            {step === 4 && (
              <p className="setup-intro">
                {translate(
                  "Your selected changes have been applied. Continue with any of these next steps when you’re ready.",
                )}
              </p>
            )}
            {step === 4 && (
              <aside className="setup-next-steps">
                <h4>{translate("Your next steps")}</h4>
                <ul>
                  {answers.rendering === "headless" && (
                    <li>
                      {translate(
                        "Headless rendering is configured in your front end. This guide leaves script insertion and security settings as they are.",
                      )}{" "}
                      {savedRedirect &&
                        nextStepLink(
                          "https://docs.solspace.com/craft/freeform/v5/",
                          "Explore the docs",
                        )}
                    </li>
                  )}
                  {answers.rendering === "custom" && (
                    <li>
                      {nextStepLink(
                        generateUrl("settings/template-manager"),
                        "Set up your custom formatting template directory",
                      )}
                    </li>
                  )}
                  {answers.needs.some((need) =>
                    ["ai", "aiProcessing"].includes(need),
                  ) && (
                    <li>
                      {nextStepLink(
                        generateUrl("settings/ai"),
                        "Set up AI and choose where to use it",
                      )}
                    </li>
                  )}
                  {answers.needs.includes("external") && (
                    <li>
                      {nextStepLink(
                        generateUrl("integrations"),
                        "Connect services and map fields on each form",
                      )}
                    </li>
                  )}
                  {answers.needs.includes("uploads") &&
                    !options.catalog?.defaultUploadSource?.length && (
                      <li>
                        {nextStepLink(
                          options.assetSettingsUrl ||
                            generateUrl("settings/general"),
                          "Set up an upload volume",
                        )}
                        <p className="setup-note">
                          {translate(
                            "Configure an asset volume in Craft, then allow it under Allowed Upload Volumes in Freeform settings.",
                          )}
                        </p>
                      </li>
                    )}
                  {answers.queue && answers.queue !== "ready" && (
                    <li>
                      {nextStepLink(
                        generateUrl("settings/queue-processing"),
                        "Configure background processing before enabling queue settings",
                      )}
                    </li>
                  )}
                  <li>
                    {nextStepLink(
                      generateUrl("settings/form-monitor"),
                      "Explore Form Monitor for scheduled form checks",
                    )}
                  </li>
                  <li>
                    {nextStepLink(
                      generateUrl("integrations"),
                      "Add honeypot, captcha, or other spam checks",
                    )}
                  </li>
                </ul>
              </aside>
            )}
          </div>
          {step === 0 && !workflowComplete && (
            <p
              className="setup-note setup-required-hint"
              id="setup-required-hint"
              aria-live="polite"
            >
              {translate("Answer all three questions to continue.")}
            </p>
          )}
          {step === 2 && missingRecipients.length > 0 && (
            <p className="setup-note setup-recipient-needed" aria-live="polite">
              {translate(
                "Enter alert recipients or turn off those suggestions to continue.",
              )}
            </p>
          )}
          <div className="setup-navigation">
            {step > 0 && step < 4 && (
              <button
                type="button"
                className="btn"
                disabled={saving}
                onClick={() => go(step - 1)}
              >
                {translate("Previous")}
              </button>
            )}
            {step === 4 ? (
              <button
                type="button"
                className="btn submit setup-primary"
                onClick={() => savedRedirect && onSaved(savedRedirect)}
              >
                {translate("Done")}
              </button>
            ) : step < 3 ? (
              <button
                type="button"
                className="btn submit setup-primary"
                disabled={
                  saving ||
                  !workflowComplete ||
                  (step === 2 && missingRecipients.length > 0)
                }
                aria-describedby={
                  !workflowComplete ? "setup-required-hint" : undefined
                }
                onClick={() => go(step + 1)}
              >
                {translate("Continue")}
              </button>
            ) : (
              <button
                type="button"
                className="btn submit setup-primary"
                disabled={
                  disabled() ||
                  (!!resources.profile && !profileName.trim()) ||
                  (!!resources.templates &&
                    (!teamName.trim() || !visitorName.trim()))
                }
                onClick={save}
              >
                {translate(saving ? "Saving…" : "Apply setup")}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};
