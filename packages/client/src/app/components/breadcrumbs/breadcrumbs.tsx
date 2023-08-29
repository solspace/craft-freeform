import type React from 'react';

import { useBreadcrumbs } from './breadcrumbs.context';

type Props = Breadcrumb;

export const Breadcrumb: React.FC<Props> = (crumb) => {
  useBreadcrumbs(crumb);

  return null;
};
