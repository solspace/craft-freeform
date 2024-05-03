import type { PropsWithChildren } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import config from '@config/freeform/freeform.config';
import type { Site } from '@ff-client/types/sites';

type ContextType = {
  current?: Site;
  list?: Site[];
  change: (site: number | string) => void;
};

const SiteContext = createContext<ContextType>({
  change: () => void {},
});

export const useSiteContext = (): ContextType => useContext(SiteContext);

export const SiteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [current, setCurrent] = React.useState<Site>(
    config.sites.list.find((site) => site.id === config.sites.current)
  );

  const change = useCallback(
    (site: string) => {
      console.log('>>>', site);
      const foundSite = config.sites.list.find((s) => s.handle === site);
      if (foundSite) {
        setCurrent(foundSite);
      }
    },
    [config.sites, current]
  );

  console.log(current);

  useEffect(() => {
    //
  }, []);

  return (
    <SiteContext.Provider
      value={{
        current,
        list: config.sites.list,
        change,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
