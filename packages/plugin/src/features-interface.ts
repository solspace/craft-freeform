type DefaultView =
  | "dashboard"
  | "forms"
  | "submissions"
  | "fields"
  | "notifications"
  | "settings"
  | "resources"
  | "export-profiles";

type SpamProtectionBehaviour =
  | "display_errors"
  | "simulate_success"
  | "reload_form";

type DatabaseDriver = "mysql" | "pgsql";
type JSInsertLocation = "footer" | "form" | "none";
type RecaptchaType = "v2" | "v2checkbox" | "v3";
type Edition = "pro" | "lite";

interface PluginInfo {
  version: string;
  edition: string;
  license: string;
  installDate: string;
}

interface Features {
  version: string;
  statistics: {
    system: {
      databaseDriver: DatabaseDriver;
      phpVersion: string;
      craftVersion: string;
      craftEdition: Edition;
      licenseKey: boolean;
      formFieldType: boolean;
      submissionsFieldType: boolean;
      userGroups: boolean;
      multiSite: boolean;
      languages: boolean;
      legacyFreeform: boolean;
      plugins: { [handle: string]: PluginInfo };
    };
    totals: {
      forms: number;
      fields: number;
      emailNotifications: number;
      submissions: number;
      spam: number;
      errors: number;
    };
    general: {
      databaseNotifications: boolean;
      fileNotifications: boolean;
      customFormattingTemplates: boolean;
      exportProfiles: boolean;
      crm: string[];
      gtm: boolean;
      mailingLists: string[];
      webhooks: string[];
      paymentGateways: string[];
      payments: {
        single: boolean;
        subscription: boolean;
      };
    };
    settings: {
      customPluginName: boolean;
      defaultView: DefaultView;
      renderHtmlInComposer: boolean;
      ajaxEnabledByDefault: boolean;
      includeDefaultFormattingTemplates: boolean;
      removeNewlinesOnExport: boolean;
      populateValuesFromGet: boolean;
      disableSubmit: boolean;
      autoScroll: boolean;
      jsInsertLocation: JSInsertLocation;
      purgeSubmissions: boolean;
      purgeInterval: 7;
      formattingTemplatesPath: boolean;
      sendAlertsOnFailedNotifications: boolean;
      notificationTemplatesPath: boolean;
      modifiedStatuses: boolean;
      demoTemplatesInstalled: boolean;
    };
    spam: {
      honeypot: boolean;
      customHoneypotName: boolean;
      javascriptEnhancement: boolean;
      spamProtectionBehaviour: SpamProtectionBehaviour;
      spamFolder: boolean;
      purgeSpam: boolean;
      purgeInterval: number;
      blockEmail: boolean;
      blockKeywords: boolean;
      blockIp: boolean;
      submissionThrottling: boolean;
      minSubmitTime: boolean;
      submitExpiration: boolean;
      recaptcha: boolean;
      recaptchaType: RecaptchaType;
    };
    fields: {
      text: boolean;
      textarea: boolean;
      email: boolean;
      hidden: boolean;
      select: boolean;
      multiSelect: boolean;
      checkbox: boolean;
      checkboxGroup: boolean;
      radioGroup: boolean;
      file: boolean;
      number: boolean;
      dynamicRecipients: boolean;
      dateTime: boolean;
      phone: boolean;
      rating: boolean;
      regex: boolean;
      website: boolean;
      opinionScale: boolean;
      signature: boolean;
      table: boolean;
      invisible: boolean;
      html: boolean;
      richText: boolean;
      confirm: boolean;
      password: boolean;
      usingSource: boolean;
    };
    forms: {
      multiPage: boolean;
      builtInAjax: boolean;
      notStoringSubmissions: boolean;
      postForwarding: boolean;
      collectIp: boolean;
      optInDataStorage: boolean;
      limitSubmissionRate: boolean;
      formTagAttributes: boolean;
      adminNotifications: boolean;
      loadingIndicators: boolean;
      conditionalRules: {
        fields: boolean;
        pages: boolean;
      };
      elementConnections: {
        entries: boolean;
        users: boolean;
      };
    };
    widgets: {
      linear: boolean;
      radial: boolean;
      fieldValues: boolean;
      recent: boolean;
      quickForm: boolean;
      stats: boolean;
    };
    other: {
      jsFramework: boolean;
      caching: boolean;
      customModule: boolean;
      gdpr: boolean;
      editingSubmissions: boolean;
      displayingSubmissions: boolean;
    };
  };
}
