export type ModalType = {
  title?: string;
  content: React.ReactNode;
  onSave?: () => boolean | Promise<boolean>;
};
