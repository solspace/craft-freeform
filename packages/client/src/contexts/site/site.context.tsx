import type { PropsWithChildren } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '@config/freeform/freeform.config';
import type { Site } from '@ff-client/types/sites';

const DEFAULT_HANDLE = 'default';

type ContextType = {
  current?: Site;
  list?: Site[];
  change: (site: number | string) => void;
  getCurrentHandleWithFallback: () => string;
};

const SiteContext = createContext<ContextType>({
  change: () => void {},
  getCurrentHandleWithFallback: () => '',
});

export const useSiteContext = (): ContextType => useContext(SiteContext);

export const SiteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [current, setCurrent] = React.useState<Site>(
    config.sites.list.find((site) => site.id === config.sites.current)
  );

  useEffect(() => {
    const links = document.querySelectorAll('#nav a[href*="site="]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        link.setAttribute(
          'href',
          href.replace(/([?&])site=[^&]+/, `$1site=${current?.handle}`)
        );
      }
    });
  }, [current]);

  const change = useCallback(
    (site: string) => {
      const foundSite = config.sites.list.find((s) => s.handle === site);
      if (foundSite) {
        setCurrent(foundSite);

        const params = new URLSearchParams(location.search);
        params.set('site', foundSite.handle);

        navigate(location.pathname + '?' + params.toString());
      }
    },
    [config.sites, current, location]
  );

  return (
    <SiteContext.Provider
      value={{
        current,
        list: config.sites.list,
        change,
        getCurrentHandleWithFallback: () =>
          current ? current.handle : DEFAULT_HANDLE,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
