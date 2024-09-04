export type TranslationType = 'fields' | 'form' | 'buttons';

export type TranslationItems = Record<string, string>;
export type TranslationSet = Record<string, TranslationItems>;

export type TranslationState = Record<
  number,
  Record<TranslationType, TranslationSet>
>;

export type UpdateProps = {
  siteId: number;
  type: 'fields' | 'form' | 'buttons';
  namespace: string;
  handle: string;
  value: string;
};
