import { useEffect, useState } from 'react';
import type { RootState } from '@editor/store';
import type {
  Suggestion,
  SuggestionCategory,
} from '@ff-client/types/notifications';
import axios from 'axios';
import type { Store } from 'redux';
import type { Editor } from 'tinymce';

let fetchedSuggestions: SuggestionCategory[];

const compileStoreSuggestions = (store: Store<RootState>): Suggestion[] => {
  const fields: Suggestion[] = [];
  store.getState().layout.fields.forEach((field) => {
    fields.push({
      shortName: field.properties.label,
      name: field.properties.label,
      token: `field.${field.uid}`,
    });
  });

  return fields;
};

export const useSuggestions = (editor: Editor): SuggestionCategory[] => {
  const store = editor.getParam('store');

  const [compiled, setCompiled] = useState<SuggestionCategory[]>([]);

  useEffect(() => {
    if (fetchedSuggestions) {
      setCompiled([
        ...fetchedSuggestions,
        {
          name: 'Fields',
          items: compileStoreSuggestions(store),
        },
      ]);
    } else {
      axios.get('/api/templates/notifications/suggestions').then((res) => {
        fetchedSuggestions = res.data;
        setCompiled(fetchedSuggestions);
      });
    }
  }, [fetchedSuggestions]);

  return compiled;
};
