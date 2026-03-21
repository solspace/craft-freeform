export type PaymentHistory = {
  package_price?: number;
  credits?: number;
  amount_added?: number;
  paid_at?: string;
};

export type DailyMetric = {
  date: string;
  credits: number;
  api_requests: number;
  successful_requests: number;
  failed_requests: number;
};

export type RequestLog = {
  date: string | null;
  status: 'success' | 'failure' | string;
  credits: number | null;
  request_id: string;
};

export type AiUsageResponse = {
  mode?: 'trial' | 'plan' | 'blocked' | 'unknown';
  mode_label?: string | null;
  is_trial?: boolean;
  trial_days_remaining?: number | null;
  trial_expires_at?: string | null;
  trial_percent_used?: number | null;
  plan_name?: string | null;
  plan_percent_remaining?: number | null;
  can_use_ai?: boolean;
  credit_status?:
    | 'Free trial'
    | 'Active'
    | 'Low credits'
    | 'Out of credit'
    | string;
  credit_status_color?: string | null;
  credits_total?: number | null;
  credits_remaining?: number | null;
  lifetime_credits_purchased?: number | null;
  user_email?: string | null;
  created_at?: string | null;
  payment_history?: PaymentHistory[];
  daily_metrics?: DailyMetric[];
  request_logs?: RequestLog[];
};

export type CreditBundlePlan = {
  key: string;
  price: number;
  currency: string;
  credits: number;
  label: string;
  name?: string;
  description?: string;
  suggested?: boolean;
};

export type AiPlansResponse = {
  cost_per_credit: number;
  trial_credits?: number | null;
  bundles: CreditBundlePlan[];
  currency?: string;
  supported_currencies?: string[];
};
