export enum AttributeTarget {
  Container = 'container',
  Input = 'input',
  Label = 'label',
  Instructions = 'instructions',
  Error = 'error',
}

type Value = string | boolean | number | null;

export type Attribute = [Value, Value];

export type AttributeCollection = {
  [key in AttributeTarget]?: Attribute[];
};
