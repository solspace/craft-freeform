import type { RootState } from "@editor/store";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type {
  Suggestion,
  SuggestionCategory,
} from "@ff-client/types/notifications";
import axios from "axios";
import { useEffect, useState } from "react";
import type { Store } from "redux";

import type { TokenBackend } from "../tokens.types";

let fetchedSuggestions: SuggestionCategory[];

const compileStoreSuggestions = (
  store: Store<RootState>,
  siteId?: number,
): Suggestion[] => {
  const fields: Suggestion[] = [];
  const fieldTranslations = store.getState().translations?.[siteId]?.fields;

  store.getState().layout.fields.forEach((field) => {
    const label =
      (fieldTranslations?.[field.uid]?.label as string | undefined) ??
      field.properties.label;

    fields.push({
      shortName: label,
      name: label,
      token: `fieldUids['${field.uid}']`,
    });
  });

  return fields;
};

export const useSuggestions = (backend: TokenBackend): SuggestionCategory[] => {
  const { store } = backend;
  const { current: currentSite } = useSiteContext();

  const [compiled, setCompiled] = useState<SuggestionCategory[]>([]);

  useEffect(() => {
    if (fetchedSuggestions) {
      setCompiled([
        ...fetchedSuggestions,
        {
          name: "Fields",
          items: compileStoreSuggestions(store, currentSite?.id),
        },
      ]);
    } else {
      axios.get("/api/templates/notifications/suggestions").then((res) => {
        fetchedSuggestions = res.data;
        setCompiled(fetchedSuggestions);
      });
    }
  }, [store, currentSite]);

  return compiled;
};
