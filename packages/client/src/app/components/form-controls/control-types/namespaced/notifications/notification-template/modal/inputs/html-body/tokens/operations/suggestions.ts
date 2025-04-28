import type { RootState } from '@editor/store';
import { clone } from 'lodash';
import type { Store } from 'redux';

type SuggestionCategory = {
  name: string;
  items: Suggestion[];
};

type Suggestion = { text: string; value: string };

export const getSuggestions = (
  store: Store<RootState>
): SuggestionCategory[] => {
  const suggestions = clone(defaultSuggestions);

  const fields: Suggestion[] = [];
  store.getState().layout.fields.forEach((field) => {
    fields.push({
      text: field.properties.label,
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
    ],
  },
  {
    name: 'Form',
    items: [
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
    ],
  },
  {
    name: 'Predefined',
    items: [
      {
        text: 'Field Labels and Values',
        value: 'loop.field.labels',
      },
    ],
  },
];
