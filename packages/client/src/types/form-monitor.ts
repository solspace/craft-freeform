export interface FormTest {
  id?: number;
  formId?: number;
  dateAttempted?: string;
  dateCompleted?: string;
  status?: "success" | "failed" | "pending";
  totalStatus?: "success" | "failed" | "pending";
  response: string;
  responseCode: number;
  customerId?: number;
  screenshot?: string;
  beforeSubmitScreenshot?: string;
  submissionDuration?: number;
  notifications?: {
    type?: string;
  }[];
  totalNotifications?: number;
  totalResponse?: string;
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
  lastTest?: FormTest;
  percentage: {
    success: number;
    failed: number;
    pending: number;
  };
  error?: {
    exception: string;
    message: string;
  };
}

export interface FormTestsResponse {
  tests: TestGroup[];
  stats: TestStats;
  enabled: boolean;
  url: string;
  formId: number;
  lastSubmission?: FormTest;
  notifications?: {
    enabled: boolean;
  };
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
  error?: {
    exception: string;
    message: string;
  };
}
