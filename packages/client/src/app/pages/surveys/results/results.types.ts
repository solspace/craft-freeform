export type Breakdown = {
  label: string;
  value: string;
  votes: number;
  ranking: number;
  percentage: number;
};

type Form = {
  id: number;
  name: string;
  handle: string;
  color: string;
  submissions: number;
  spam?: number;
};

export type Field = {
  id: number;
  handle: string;
  label: string;
  type: string;
  class: string;
  multiChoice: boolean;
};

export type Result = {
  field: Field;
  average?: number;
  max: number;
  votes: number;
  skipped: number;
  breakdown: Breakdown[];
};

export type SurveyData = {
  form: Form;
  votes: number;
  results: Result[];
};

export enum Chart {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
  Pie = 'Pie',
  Donut = 'Donut',
  Hidden = 'Hidden',
  Text = 'Text',
}

export type SurveyPreferences = {
  highlightHighest: boolean;
  chartDefaults: Record<string, Chart>;
  permissions: {
    form: boolean;
    submissions: boolean;
    reports: boolean;
  };
  fieldSettings: Array<{
    id: number;
    chartType: Chart;
  }>;
};

export type SurveyChart = Array<{
  name: string;
  x: string;
  y: number;
}>;
