import { useCallback } from 'react';
import { useLocalStorage } from '@ff-client/hooks/ts-hooks/use-local-storage';

import type { TypeDefinition } from './integration.types';

const INTEGRATIONS_FAVORITES_STORAGE_KEY = 'integrations-favorites';

type TitlebarFavorites = {
  toggleFavorite: (integrationType: TypeDefinition) => void;
  hasFavorite: (integrationType: TypeDefinition) => boolean;
};

export const useTitlebarFavorites = (): TitlebarFavorites => {
  const [handles, setHandles] = useLocalStorage<string[]>(
    INTEGRATIONS_FAVORITES_STORAGE_KEY,
    []
  );

  const toggleFavorite = useCallback(
    (integrationType: TypeDefinition): void => {
      const key = getIntegrationTypeFavoriteKey(integrationType);

      setHandles((prev) => {
        const favorites = sanitizeFavoriteHandles(prev);
        if (favorites.has(key)) {
          favorites.delete(key);
        } else {
          favorites.add(key);
        }

        return Array.from(favorites);
      });
    },
    [setHandles]
  );

  const hasFavorite = useCallback(
    (integrationType: TypeDefinition): boolean => {
      const key = getIntegrationTypeFavoriteKey(integrationType);

      return sanitizeFavoriteHandles(handles).has(key);
    },
    [handles]
  );

  return {
    toggleFavorite,
    hasFavorite,
  };
};

const sanitizeFavoriteHandles = (handles: string[]): Set<string> =>
  new Set(handles.map((handle) => handle.trim()).filter(Boolean));

const getIntegrationTypeFavoriteKey = ({
  type,
  shortName,
}: TypeDefinition): string => {
  return `${type}:${shortName}`;
};
