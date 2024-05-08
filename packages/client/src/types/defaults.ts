type ConfigItem<T = string> = {
  value: T;
  locked: boolean;
};

export type Defaults = {
  previewHtml: boolean;
  twigInHtml: boolean;
  twigIsolation: boolean;
  includeSampleTemplates: boolean;

  notifications: {
    admin: { template: ConfigItem<string> };
    conditional: { template: ConfigItem<string> };
    userSelect: { template: ConfigItem<string> };
    emailField: { template: ConfigItem<string> };
  };
  settings: {
    general: {
      formType: ConfigItem<string>;
      submissionTitle: ConfigItem<string>;
      formattingTemplate: ConfigItem<string>;
    };
    dataStorage: {
      store: ConfigItem<boolean>;
      defaultStatus: ConfigItem<string>;
      collectIp: ConfigItem<boolean>;
    };
    processing: {
      ajax: ConfigItem<boolean>;
      showIndicator: ConfigItem<boolean>;
      showText: ConfigItem<boolean>;
      indicatorText: ConfigItem<string>;
    };
    successAndErrors: {
      behavior: ConfigItem<string>;
      returnUrl: ConfigItem<string>;
      successMessage: ConfigItem<string>;
      errorMessage: ConfigItem<string>;
    };
    limits: {
      duplicateCheck: ConfigItem<string>;
    };
  };
};
