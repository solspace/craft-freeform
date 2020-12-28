export enum DefaultView {
  Dashboard = 'dashboard',
  Forms = 'forms',
  Submissions = 'submissions',
}
export enum FormattingTemplate {
  Bootstrap = 'bootstrap.html',
  Bootstrap4 = 'bootstrap-4.html',
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

export interface GeneralInterface {
  name: string;
  defaultView: DefaultView;
  ajax: boolean;
  defaultFormattingTemplate: FormattingTemplate;
  disableSubmit: boolean;
  autoScroll: boolean;
  jsInsertLocation: JSInsertLocation;
}

export enum DigestFrequency {
  Daily = 'daily',
  WeeklySundays = 'weekly-sunday',
  WeeklyMondays = 'weekly-mondays',
  WeeklyTuesdays = 'weekly-tuesdays',
  WeeklyWednesdays = 'weekly-wednesdays',
  WeeklyThursdays = 'weekly-thursdays',
  WeeklyFridays = 'weekly-fridays',
  WeeklySaturdays = 'weekly-saturdays',
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
