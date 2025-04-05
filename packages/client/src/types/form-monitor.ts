export interface FormTest {
  id: number;
  formId: number;
  dateAttempted: string;
  dateCompleted: string;
  status: 'success' | 'failed' | 'pending';
  response: string;
  responseCode: number;
  customerId: number;
  screenshot?: string;
}

export interface TestGroup {
  date: string;
  tests: FormTest[];
  isInactive?: boolean;
}

export interface TestStats {
  success: number;
  failed: number;
  pending: number;
  total: number;
  percentage: {
    success: number;
    failed: number;
    pending: number;
  };
}

export interface FormTestsResponse {
  tests: TestGroup[];
  stats: TestStats;
  enabled: boolean;
  url: string;
  formId: number;
  lastSubmission?: FormTest;
  fmFormStats?: {
    enabled: boolean;
    nextMonitoringTime: string;
    nextMonitoringTimeIn: {
      humanReadable: string;
      minutes: number;
      hours: number;
      remainingMinutes: number;
    };
  };
}
