export type Attributes = Record<string, string>;
export type Categories = 'container' | 'error' | 'input' | 'instructions' | 'label';

export type AttributeList = {
  form: {
    success: Attributes;
    error: Attributes;
  };
  fields: Record<string, CategorizedAttributes>;
};

export type CategorizedAttributes = Record<Categories, Attributes>;

export type AttributeRecord = {
  name: string;
  value: string;
  ns: string | null;
};

export type AttributeSnapshot = {
  attrs: AttributeRecord[];
  names: Set<string>;
};
