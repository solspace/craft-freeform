import type { RootState } from '@editor/store';
import { clone } from 'lodash';
import type { Store } from 'redux';

type Suggestion = { text: string; value: string };

export const getSuggestions = (store: Store<RootState>): Suggestion[] => {
  const suggestions = clone(defaultSuggestions);

  store.getState().layout.fields.forEach((field) => {
    suggestions.push({
      text: field.properties.label,
      value: `field.${field.uid}`,
    });
  });

  return suggestions;
};

const defaultSuggestions: Suggestion[] = [
  {
    text: 'Submission ID',
    value: 'submission.id',
  },
  {
    text: 'Submission Date',
    value: 'submission.date',
  },
  {
    text: 'Submission Status',
    value: 'submission.status',
  },
  {
    text: 'Form ID',
    value: 'form.id',
  },
  {
    text: 'Form Name',
    value: 'form.name',
  },
  {
    text: 'Form Handle',
    value: 'form.handle',
  },
  {
    text: 'Field Labels and Values',
    value: 'loop.field.labels',
  },
  // Add more suggestions as needed...
];
