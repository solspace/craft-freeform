export type ModifyPropertyFormTagAttributeHandlerProps = {
  index: number;
  key: string;
  value: string | number | boolean;
};

export type ModifyPropertyHandlerProps = {
  key: string;
  value: string | number | boolean;
};

export type FormTagAttributeHandlerProps = {
  index: number;
  attributeKey: string;
  attributeValue: string | number | boolean;
  onDeleteField: (payload: number) => void;
  onChangeField: (payload: ModifyPropertyFormTagAttributeHandlerProps) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericValue = any;
