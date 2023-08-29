import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import type { Breadcrumb } from './breadcrumbs.types';

type ContextType = {
  stack: Breadcrumb[];
  pushCrumb: (crumb: Breadcrumb) => void;
  popCrumb: () => void;
};

const BreadcrumbContext = createContext<ContextType>({
  stack: [],
  pushCrumb: () => void {},
  popCrumb: () => void {},
});

export const useBreadcrumbs = (crumb: Breadcrumb): void => {
  const { pushCrumb, popCrumb } = useContext(BreadcrumbContext);

  useEffect(() => {
    pushCrumb(crumb);

    return () => {
      popCrumb();
    };
  }, [crumb]);
};

export const BreadcrumbProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [stack, setStack] = useState<Breadcrumb[]>([]);

  const pushCrumb = (crumb: Breadcrumb): void => {
    setStack((stack) => [...stack, crumb]);
  };

  const popCrumb = (): void => {
    setStack((stack) => stack.slice(0, stack.length - 1));
  };

  useEffect(() => {
    document.getElementById('crumbs').style.display = 'block';
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ stack, pushCrumb, popCrumb }}>
      {children}
      {createPortal(
        <nav aria-label="Breadcrumbs">
          <ul className="breadcrumb-list">
            {stack.map(({ label, url }, i) => (
              <li key={i}>
                <Link to={url}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>,
        document.getElementById('crumbs')
      )}
      {}
    </BreadcrumbContext.Provider>
  );
};
