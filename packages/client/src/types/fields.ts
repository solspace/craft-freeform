export type FieldType = {
  name: string;
  type: string;
  class: string;
  icon?: string;
  storable: boolean;
};

enum DraggableTypes {
  NewField,
  ExistingField,
}

export type DraggableField = {
  type: DraggableTypes;
};
