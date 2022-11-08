export type FormTagAttributeProps = {
  index?: number;
  key: string;
  value: string | number | boolean;
};

export type FormTagAttributeInputProps = {
  id: string;
  value: FormTagAttributeProps[] | [];
  onChange: (value: FormTagAttributeProps[]) => void;
};

export type PropertiesProps = {
  name: string;
  handle: string;
  defaultStatus: number;
  submissionTitleFormat: string;
  formattingTemplate: string;
  description: string;
  color: string;
  storeSubmittedData: false;
  enableCaptchas: false;
  optInDataStorageTargetHash: number;
  formTagAttributes: FormTagAttributeProps[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericValue = any;
