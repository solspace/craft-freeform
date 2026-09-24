export type EmailSuggestionLabels = {
  message?: string;
  action?: string;
};

export type EmailSuggestionConfig = {
  suggestEmailCorrections?: boolean;
  emailSuggestionLabels?: EmailSuggestionLabels;
};
