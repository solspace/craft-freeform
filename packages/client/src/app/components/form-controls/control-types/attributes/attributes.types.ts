export enum AttributeTarget {
  Container = 'container',
  Input = 'input',
  Label = 'label',
  Instructions = 'instructions',
  Error = 'error',
}

export type AttributeCollection = {
  [key in AttributeTarget]?: {
    [attribute: string]: string;
  };
};

export type AttributeEntry = [string, string];

export type EditableAttributeCollection = {
  [key in AttributeTarget]?: AttributeEntry[];
};
