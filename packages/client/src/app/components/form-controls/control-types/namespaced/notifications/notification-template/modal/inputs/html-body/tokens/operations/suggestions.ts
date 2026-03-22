import type { RootState } from "@editor/store";
import type {
  Suggestion,
  SuggestionCategory,
} from "@ff-client/types/notifications";
import axios from "axios";
import { useEffect, useState } from "react";
import type { Store } from "redux";

import type { TokenBackend } from "../tokens.types";

let fetchedSuggestions: SuggestionCategory[];

const compileStoreSuggestions = (store: Store<RootState>): Suggestion[] => {
  const fields: Suggestion[] = [];
  store.getState().layout.fields.forEach((field) => {
    fields.push({
      shortName: field.properties.label,
      name: field.properties.label,
      token: `fieldUids['${field.uid}']`,
    });
  });

  return fields;
};

export const useSuggestions = (backend: TokenBackend): SuggestionCategory[] => {
  const { store } = backend;

  const [compiled, setCompiled] = useState<SuggestionCategory[]>([]);

  useEffect(() => {
    if (fetchedSuggestions) {
      setCompiled([
        ...fetchedSuggestions,
        {
          name: "Fields",
          items: compileStoreSuggestions(store),
        },
      ]);
    } else {
      axios.get("/api/templates/notifications/suggestions").then((res) => {
        fetchedSuggestions = res.data;
        setCompiled(fetchedSuggestions);
      });
    }
  }, [store]);

  return compiled;
};
