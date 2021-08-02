export type FileMetadata = {
  id?: string;
  name: string;
  extension: string;
  size: string;
  url?: string;
};

export enum ErrorTypes {
  FieldError = 'field-error',
}

export type FieldError = {
  type: ErrorTypes.FieldError;
  fileMessages: string[];
  messages: string[];
};

export type ChangeEvent = Event & {
  container: HTMLElement;
};

export type UploadProgress = {
  total: number;
  loaded: number;
  percent: number;
};

export type UploadProgressEvent = Event & UploadProgress;

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif'];
export const isImage = (extension: string): boolean => imageExtensions.includes(extension.toLowerCase());
