export type FormTagAttributeProps = {
  key: string;
  value: string | number | boolean;
};

export type FormProperties = {
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

export type Form = {
  id?: number;
  uid: string;
  type: string;
  properties: FormProperties;
};
