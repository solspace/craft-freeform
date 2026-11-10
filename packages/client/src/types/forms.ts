import type { Layout, Page, Row } from "@editor/builder/types/layout";
import type { Field } from "@editor/store/slices/layout/fields";
import type {
  TranslationItems,
  TranslationType,
} from "@editor/store/slices/translations/translations.types";
import type {
  GenericValue,
  Property,
  Section,
} from "@ff-client/types/properties";

export type SettingsNamespace = {
  namespaceType: "settings";
  namespace: string;
  [key: string]: GenericValue;
};

export type SettingCollection = {
  [namespace: string]: SettingsNamespace;
};

type FormOwnershipMeta = {
  datetime: string;
  user: {
    id: number;
    url: string;
    name: string;
  };
};

type FormOwnership = {
  created: FormOwnershipMeta;
  updated: FormOwnershipMeta;
};

export type Form = {
  id?: number;
  uid: string;
  type: string;
  name: string;
  handle: string;
  description?: string;
  iconSvg?: string | null;
  isNew: boolean;
  settings: SettingCollection;
  ownership?: FormOwnership;
  dateArchived: string | null;
  formMonitor?: {
    enabled: boolean;
  };
  canManageSubmissions?: boolean;
  submissionCount?: number;
};

export type ExtendedFormType = Form & {
  translations: {
    [siteId: string]: {
      [type in TranslationType]: {
        [namespace: string]: TranslationItems;
      };
    };
  };
  layout: {
    fields: Field[];
    pages: Page[];
    layouts: Layout[];
    rows: Row[];
  };
};

export type FormWithStats = Form & {
  id: number;
  cardSize?: FormCardSize;
  cardContent?: FormCardContent;
  cardFieldId?: number | null;
  links: Array<{
    label: string;
    handle: string;
    url: string;
    type: string;
    count: number;
    internal: boolean;
  }>;
  chartData: Array<{ uv: number }>;
  counters: {
    submissions: number;
    spam: number;
  };
};

export type FormCardSize = "1x1" | "2x1" | "1x2" | "2x2";
export type DashboardWidgetSize = FormCardSize | "3x2" | "2x3" | "3x3";
export type FormCardContent =
  | "overview"
  | "activity"
  | "statistics"
  | "monitor"
  | "field";
export type FormCardDays = 7 | 30 | 90;

export type FormSettingNamespace = {
  label: string;
  handle: string;
  order: number;
  sections: Section[];
  properties: Property[];
};
