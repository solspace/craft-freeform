import type React from 'react';
import { useEffect } from 'react';

import { useBreadcrumbs } from './breadcrumbs.context';
import type { Breadcrumb as BreadcrumbType } from './breadcrumbs.types';

type Props = BreadcrumbType;

export const Breadcrumb: React.FC<Props> = (crumb) => {
  const { pushCrumb, popCrumb } = useBreadcrumbs();

  useEffect(() => {
    pushCrumb(crumb);

    return () => {
      popCrumb();
    };
  }, []);

  return null;
};
