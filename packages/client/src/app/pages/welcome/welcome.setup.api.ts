import { generateUrl } from "@ff-client/utils/urls";
import axios from "axios";

export type SetupKey =
  | "abTests"
  | "emailTemplateMethod"
  | "emailTemplateStorageType"
  | "emailTemplateDefault"
  | "defaultFromEmail"
  | "defaultFromName"
  | "spamProtectionBehavior"
  | "spamFolderEnabled"
  | "loggingStyle"
  | "activityMode"
  | "loggingLevel"
  | "defaultView"
  | "defaultAiIntegration"
  | "useQueueForEmailNotifications"
  | "useQueueForIntegrations"
  | "useQueueForAiFields"
  | "alertNotificationRecipients"
  | "errorNotificationRecipients"
  | "clientDigestRecipients"
  | "clientDigestFrequency"
  | "defaultFormattingTemplate"
  | "defaultStoreData"
  | "defaultUploadSource"
  | "defaultUploadCount"
  | "defaultUploadSize"
  | "defaultUploadKinds"
  | "defaultUploadRequirements";
export type SetupValues = Record<SetupKey, string>;
export type SetupSelectOption = { value: string; label: string };
export type SetupOptions = {
  values: SetupValues;
  locked: SetupKey[];
  canSave: boolean;
  catalog?: Partial<Record<SetupKey, SetupSelectOption[]>>;
  notificationDefaults?: { admin: string; emailField: string };
  canCreateTemplates?: boolean;
  canUseAlerts?: boolean;
  canUseAi?: boolean;
  canUseAb?: boolean;
  assetSettingsUrl?: string;
};
export type SetupProfileLevel = "simplified-building" | "advanced-building";
export type SetupResources = {
  requestId: string;
  profile?: { name: string; level: SetupProfileLevel; uploads?: boolean };
  templates?: { team: string; visitor: string };
  templateDefaults?: { admin: string; emailField: string };
};
export type SetupClient = {
  load: (signal: AbortSignal) => Promise<SetupOptions>;
  save: (
    changes: Partial<SetupValues>,
    original: SetupValues,
    signal: AbortSignal,
    resources?: SetupResources,
  ) => Promise<{ redirect: string }>;
};
export const setupClient: SetupClient = {
  load: (signal) =>
    axios
      .get<SetupOptions>(generateUrl("api/setup/options"), { signal })
      .then((response) => response.data),
  save: (changes, original, signal, resources) =>
    axios
      .post<{ redirect: string }>(
        generateUrl("api/setup/save"),
        { changes, original, resources },
        { signal },
      )
      .then((response) => response.data),
};
export const changedSetupValues = (
  original: SetupValues,
  draft: SetupValues,
): Partial<SetupValues> =>
  Object.fromEntries(
    Object.entries(draft).filter(
      ([key, value]) => original[key as SetupKey] !== value,
    ),
  );
