export type MetricTab =
  | 'conversionRate'
  | 'impressions'
  | 'interactions'
  | 'failures';

export type ABStatus = 'active' | 'scheduled' | 'ended';

export type ABTest = {
  id: number;
  name: string;
  handle: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type Variant = {
  id: string | number;
  formId: number;
  weight: number;
};

export type ABTestWithVariants = ABTest & {
  variants: Variant[];
};

export type ABTestStatistics = {
  completed: number;
  served: number;
  interacted: number;
  failed: number;
};

export type ABTestDashboardSeriesPoint = {
  date: string;
  impressions: number;
  interactions: number;
  failures: number;
  conversions: number;
  conversionRate: number;
};

export type ABTestDashboardVariantStats = {
  completed: number;
  served: number;
  interacted: number;
  failed: number;
  conversionRate: number;
};

export type ABTestDashboardVariant = {
  id: number;
  formId: number;
  formName: string | null;
  formColor: string | null;
  weight: number;
  stats: ABTestDashboardVariantStats;
  series: ABTestDashboardSeriesPoint[];
};

export type ABTestDashboardItem = {
  id: number;
  name: string;
  handle: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  days: number;
  variantCount: number;
  totalImpressions: number;
  winnerVariantId: number | null;
  variants: ABTestDashboardVariant[];
};
