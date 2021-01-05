import { createContext } from 'react';

type DefaultView = 'dashboard' | 'forms' | 'submissions';
type DefaultFormattingTemplate = 'flexbox';
type JSInsertLocation = 'footer' | 'form' | 'none';
type SpamBehaviour = 'simulate_success' | 'reload';
type Frequency = 'weekly';

export interface FreeformContextInterface {
  name?: string;
  defaultView: DefaultView;
  ajax: boolean;
  defaultFormattingTemplate: DefaultFormattingTemplate;
  disableSubmit: boolean;
  autoScroll: boolean;
  jsInsertLocation: JSInsertLocation;

  honeypot: boolean;
  enhancedHoneypot: boolean;
  spamFolder: boolean;
  spamBehaviour: SpamBehaviour;

  errorRecipients: string;
  updateNotices: boolean;
  digestRecipients: string;
  digestFrequency?: Frequency;
  clientDigestRecipients?: string;
  clientDigestFrequency?: Frequency;
  digestProductionOnly: boolean;
}

const FreeformContext = createContext<FreeformContextInterface>(null);

export default FreeformContext;
