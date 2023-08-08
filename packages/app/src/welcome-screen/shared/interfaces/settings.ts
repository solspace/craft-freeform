export enum DefaultView {
  Dashboard = 'dashboard',
  Forms = 'forms',
  Submissions = 'submissions',
}
export enum FormattingTemplate {
  BasicLight = 'basic-light/index.twig',
  BasicDark = 'basic-dark/index.twig',
  BasicFloatingLabels = 'basic-floating-labels.twig',
  Bootstrap = 'bootstrap-3.twig',
  Bootstrap4 = 'bootstrap-4/index.twig',
  Bootstrap5 = 'bootstrap-5/index.twig',
  Bootstrap5Dark = 'bootstrap-5-dark/index.twig',
  Bootstrap5Floating = 'bootstrap-5-floating-labels/index.twig',
  Bootstrap5MPAllFields = 'bootstrap-5-multipage-all-fields/index.twig',
  Flexbox = 'flexbox.twig',
  Foundation = 'foundation-6.twig',
  Grid = 'grid.twig',
  Conversational = 'conversational.twig',
  Tailwind1 = 'tailwind-1.twig',
  Tailwind3 = 'tailwind-3.twig',
}
export enum JSInsertLocation {
  Footer = 'footer',
  Form = 'form',
  Manual = 'manual',
}
export enum JSInsertType {
  Pointers = 'pointers',
  Files = 'files',
  Inline = 'inline',
}
export enum SessionType {
  Payload = 'payload',
  PHPSessions = 'session',
  Database = 'database',
}

export interface GeneralInterface {
  name: string;
  defaultView: DefaultView;
  ajax: boolean;
  defaultFormattingTemplate: FormattingTemplate;
  disableSubmit: boolean;
  autoScroll: boolean;
  jsInsertLocation: JSInsertLocation;
  jsInsertType: JSInsertType;
  canInsertPointers: boolean;
  sessionType: SessionType;
}

export enum DigestFrequency {
  Daily = '-1',
  WeeklySundays = '0',
  WeeklyMondays = '1',
  WeeklyTuesdays = '2',
  WeeklyWednesdays = '3',
  WeeklyThursdays = '4',
  WeeklyFridays = '5',
  WeeklySaturdays = '6',
}

export interface ReliabilityInterface {
  errorRecipients: string;
  updateNotices: boolean;
  digestRecipients: string;
  digestFrequency: DigestFrequency;
  clientDigestRecipients: string;
  clientDigestFrequency: DigestFrequency;
  digestProductionOnly: boolean;
}

export enum SpamBehaviour {
  SimulateSuccess = 'simulate_success',
  DisplayErrors = 'display_errors',
}

export interface SpamInterface {
  honeypot: boolean;
  enhancedHoneypot: boolean;
  spamFolder: boolean;
  spamBehaviour: SpamBehaviour;
}
