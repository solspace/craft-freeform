import type { ReactNode } from 'react';
import React from 'react';

export const isEmptyChildren = (children: ReactNode): boolean =>
  React.Children.toArray(children).every((child) => child == null);
