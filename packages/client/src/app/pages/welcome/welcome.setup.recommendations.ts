import type {
  SetupKey,
  SetupOptions,
  SetupSelectOption,
} from "./welcome.setup.api";

export type SetupAnswers = {
  abTests: string;
  maintainer: string;
  rendering: string;
  scale: string;
  reuse: string;
  needs: string[];
  queue: string;
  uploadKind: string;
};
export const initialAnswers: SetupAnswers = {
  abTests: "",
  maintainer: "",
  rendering: "",
  scale: "",
  reuse: "",
  needs: [],
  queue: "",
  uploadKind: "",
};
export type Recommendation = {
  key: SetupKey;
  label: string;
  reason: string;
  value: string;
  scope:
    | "Site setting"
    | "New form default"
    | "New field default"
    | "New email template default";
  options?: SetupSelectOption[];
  type?: "text" | "number";
  optional?: boolean;
  preserved?: boolean;
};
const choices = (pairs: string[][]): SetupSelectOption[] =>
  pairs.map(([value, label]) => ({ value, label }));
const boolean = choices([
  ["true", "Enabled"],
  ["false", "Disabled"],
]);
export const recommendationsFor = (
  answers: SetupAnswers,
  options: SetupOptions,
): Recommendation[] => {
  const current = options.values;
  const result: Recommendation[] = [];
  const add = (
    key: SetupKey,
    label: string,
    reason: string,
    value: string,
    scope: Recommendation["scope"] = "Site setting",
    select?: SetupSelectOption[],
    optional = false,
    preserved = false,
  ) => {
    result.push({
      key,
      label,
      reason,
      value,
      scope,
      options: select,
      optional,
      preserved,
    });
  };
  const needs = (name: string) => answers.needs.includes(name);
  if (answers.reuse) {
    add(
      "emailTemplateMethod",
      "Template Method",
      "Match email template ownership to the way your forms will be maintained.",
      answers.reuse === "shared"
        ? "all"
        : answers.reuse === "individual"
          ? "form"
          : "all",
      "Site setting",
      choices([
        ["form", "Form-specific only"],
        ["global", "Global only"],
        ["all", "Form-specific & Global"],
      ]),
    );
  }
  if (answers.maintainer) {
    add(
      "emailTemplateStorageType",
      "Template Storage Type",
      "Database templates can be edited in Craft. File templates can be maintained with your project code.",
      answers.maintainer === "editors" ? "database" : "files_database",
      "Site setting",
      choices([
        ["database", "Database"],
        ["files_database", "File & Database"],
        ["files", "File"],
      ]),
    );
    add(
      "emailTemplateDefault",
      "New Template Type for Form Builder",
      "Start new shared email templates in the database so no template directory is required.",
      "database",
      "New email template default",
      choices([
        ["database", "Database"],
        ["files", "File"],
      ]),
    );
  }
  if (
    ["samples", "mixed"].includes(answers.rendering) &&
    options.catalog?.defaultFormattingTemplate?.length
  ) {
    const templates = options.catalog.defaultFormattingTemplate;
    add(
      "defaultFormattingTemplate",
      "Formatting Template",
      "Give new forms a ready-to-use appearance that can be changed in the builder.",
      templates.some((item) => item.value === current.defaultFormattingTemplate)
        ? current.defaultFormattingTemplate
        : templates[0].value,
      "New form default",
      templates,
    );
  }
  if (needs("review")) {
    add(
      "defaultStoreData",
      "Store Submitted Data for this Form",
      "Keep submissions available for review inside Craft on new forms.",
      "true",
      "New form default",
      boolean,
    );
    add(
      "defaultView",
      "Default View",
      "Open the submission list when your team enters Freeform. This changes the site default.",
      "submissions",
      "Site setting",
      choices([
        ["forms", "Forms"],
        ["submissions", "Submissions"],
      ]),
    );
    if (options.canUseAlerts) {
      add(
        "clientDigestRecipients",
        "Stats Digest Email",
        "Optionally send a regular performance summary to the people reviewing submissions.",
        current.clientDigestRecipients,
        "Site setting",
        undefined,
        true,
      );
      add(
        "clientDigestFrequency",
        "Stats Digest Email Frequency",
        "Choose a schedule for the stats digest if recipients are provided.",
        current.clientDigestFrequency,
        "Site setting",
        choices([
          ["-1", "Daily"],
          ["0", "Weekly on Sundays"],
          ["1", "Weekly on Mondays"],
          ["2", "Weekly on Tuesdays"],
          ["3", "Weekly on Wednesdays"],
          ["4", "Weekly on Thursdays"],
          ["5", "Weekly on Fridays"],
          ["6", "Weekly on Saturdays"],
        ]),
        true,
      );
    }
  }
  add(
    "loggingStyle",
    "Logging Style",
    "Keep a searchable record of failures and important form activity.",
    current.loggingStyle === "classic" ? "classic" : "activity",
    "Site setting",
    choices([
      ["activity", "Activity Logging"],
      ["classic", "Classic Logging"],
      ["none", "None"],
    ]),
  );
  add(
    "activityMode",
    "Recording mode",
    "Choose how much Activity history to keep for the forms you plan to build.",
    ["custom", "detailed"].includes(current.activityMode)
      ? current.activityMode
      : answers.scale === "basic"
        ? "minimal"
        : "standard",
    "Site setting",
    choices([
      ["minimal", "Minimal"],
      ["standard", "Standard"],
      ["detailed", "Detailed"],
      ...(current.activityMode === "custom" ? [["custom", "Custom"]] : []),
    ]),
    false,
    ["custom", "detailed"].includes(current.activityMode),
  );
  add(
    "loggingLevel",
    "Log Detail",
    "Record errors and critical failures.",
    current.loggingLevel,
    "Site setting",
    choices([
      ["error", "Errors"],
      ["info", "Info"],
      ["debug", "Debug"],
    ]),
  );
  add(
    "spamProtectionBehavior",
    "Spam Protection Behavior",
    "Avoid revealing spam detection to bots. Spam checks are configured separately in Integrations.",
    "simulate_success",
    "Site setting",
    choices([
      ["simulate_success", "Simulate Success"],
      ["display_errors", "Display Errors"],
    ]),
  );
  add(
    "spamFolderEnabled",
    "Use Spam Folder",
    "Keep flagged submissions available to check for false positives.",
    "true",
    "Site setting",
    boolean,
  );
  if (needs("uploads")) {
    if (answers.uploadKind)
      add(
        "defaultUploadKinds",
        "File Kinds",
        "Start new upload fields with the file types you selected.",
        answers.uploadKind,
        "New field default",
        choices([
          ["image", "Images"],
          ["pdf", "PDF documents"],
          ["image,pdf", "Images and PDFs"],
        ]),
      );

    add(
      "defaultUploadRequirements",
      "Show Upload Requirements",
      "Tell visitors which files the upload field accepts.",
      "true",
      "New field default",
      boolean,
    );
    if (options.catalog?.defaultUploadSource?.length) {
      add(
        "defaultUploadSource",
        "Asset Source",
        "Choose an existing allowed volume for new upload fields.",
        current.defaultUploadSource ||
          options.catalog.defaultUploadSource[0].value,
        "New field default",
        options.catalog.defaultUploadSource,
        !current.defaultUploadSource &&
          options.catalog.defaultUploadSource.length !== 1,
      );
    }
    add(
      "defaultUploadCount",
      "Max Files",
      "Set a starting file-count limit for new upload fields.",
      current.defaultUploadCount,
      "New field default",
    );
    add(
      "defaultUploadSize",
      "Maximum File Size",
      "Set the maximum size in KB for each file on new upload fields.",
      current.defaultUploadSize,
      "New field default",
    );
    result
      .filter((item) =>
        ["defaultUploadCount", "defaultUploadSize"].includes(item.key),
      )
      .forEach((item) => {
        item.type = "number";
      });
  }
  if (
    needs("ai") &&
    options.canUseAi &&
    options.catalog?.defaultAiIntegration?.length
  ) {
    add(
      "defaultAiIntegration",
      "Default AI Integration for Form Creation",
      "Preselect an existing AI provider for form generation. This does not enable AI processing on forms.",
      current.defaultAiIntegration ||
        options.catalog.defaultAiIntegration[0].value,
      "Site setting",
      options.catalog.defaultAiIntegration,
    );
  }
  if (needs("reliability") && options.canUseAlerts) {
    add(
      "alertNotificationRecipients",
      "Send Email Alerts for Failed Notifications",
      "Choose who should hear when an email notification cannot be delivered.",
      current.alertNotificationRecipients,
      "Site setting",
    );
    add(
      "errorNotificationRecipients",
      "Critical System Error Report Recipients",
      "Choose who should receive critical system error reports.",
      current.errorNotificationRecipients,
      "Site setting",
    );
  }
  if (answers.queue === "ready") {
    if (needs("emails"))
      add(
        "useQueueForEmailNotifications",
        "Use Queue for Email Notifications",
        "Process notification emails in the background using your configured queue runner.",
        "true",
        "Site setting",
        boolean,
      );
    if (needs("external"))
      add(
        "useQueueForIntegrations",
        "Use Queue for Integrations",
        "Process supported integration tasks in the background using your configured queue runner.",
        "true",
        "Site setting",
        boolean,
      );
    if (needs("aiProcessing") && options.canUseAi)
      add(
        "useQueueForAiFields",
        "Use Queue for AI Processing",
        "Process AI field tasks in the background using your configured queue runner.",
        "true",
        "Site setting",
        boolean,
      );
  }
  if (needs("emails") || answers.reuse === "shared") {
    add(
      "defaultFromName",
      "Default From Name for New Templates",
      "Use Craft system values or enter the sender name for new email templates.",
      current.defaultFromName,
      "New email template default",
    );
    add(
      "defaultFromEmail",
      "Default From Email for New Templates",
      "Freeform sends through Craft mail settings. Existing email templates keep their sender details.",
      current.defaultFromEmail,
      "New email template default",
    );
  }
  if (options.canUseAb)
    add(
      "abTests",
      "A/B Testing",
      "Show A/B Tests in navigation only if you plan to use the feature.",
      answers.abTests || current.abTests,
      "Site setting",
      boolean,
    );
  return result;
};
