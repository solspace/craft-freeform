export enum InputAttributeTarget {
  Container = 'container',
  Input = 'input',
  Label = 'label',
  Instructions = 'instructions',
  Error = 'error',
}

export type Attributes = Record<string, string>;

export type AttributeCollection<T extends PropertyKey> = {
  [key in T]?: Attributes;
};

export type AttributeEntry = [string, string];

export type EditableAttributeCollection = {
  [key in InputAttributeTarget]?: AttributeEntry[];
};
