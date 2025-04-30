import type { RootState } from '@editor/store';
import { clone } from 'lodash';
import type { Store } from 'redux';

export type SuggestionCategory = {
  name: string;
  items: Suggestion[];
};

export type Suggestion = {
  label: string;
  token: string;
  value: string;
  active?: boolean;
};

export const getSuggestions = (
  store: Store<RootState>
): SuggestionCategory[] => {
  const suggestions = clone(defaultSuggestions);

  const fields: Suggestion[] = [];
  store.getState().layout.fields.forEach((field) => {
    fields.push({
      label: field.properties.label,
      token: field.properties.label,
      value: `field.${field.uid}`,
    });
  });

  suggestions.push({
    name: 'Fields',
    items: fields,
  });

  return suggestions;
};

const defaultSuggestions: SuggestionCategory[] = [
  {
    name: 'Submission',
    items: [
      {
        token: 'Submission ID',
        label: 'ID',
        value: 'submission.id',
      },
      {
        token: 'Submission Date',
        label: 'Date',
        value: 'submission.date',
      },
      {
        token: 'Submission Status',
        label: 'Status',
        value: 'submission.status',
      },
    ],
  },
  {
    name: 'Form',
    items: [
      {
        token: 'Form ID',
        label: 'ID',
        value: 'form.id',
      },
      {
        token: 'Form Name',
        label: 'Name',
        value: 'form.name',
      },
      {
        token: 'Form Handle',
        label: 'Handle',
        value: 'form.handle',
      },
    ],
  },
  {
    name: 'Predefined',
    items: [
      {
        token: 'Field Labels and Values',
        label: 'Field Labels and Values',
        value: 'loop.field.labels',
      },
    ],
  },
];
