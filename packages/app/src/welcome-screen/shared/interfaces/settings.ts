export enum DefaultView {
  Dashboard = 'dashboard',
  Forms = 'forms',
  Submissions = 'submissions',
}
export enum FormattingTemplate {
  Bootstrap = 'bootstrap.html',
  Bootstrap4 = 'bootstrap-4.html',
  Bootstrap5 = 'bootstrap-5.html',
  Flexbox = 'flexbox.html',
  Foundation = 'foundation.html',
  Grid = 'grid.html',
  Tailwind = 'tailwind.html',
}
export enum JSInsertLocation {
  Footer = 'footer',
  Form = 'form',
  Manual = 'manual',
}
export enum JSInsertType {
  Static = 'static',
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
