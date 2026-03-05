import type { PropsWithChildren } from 'react';
import React from 'react';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import type { Property } from '@ff-client/types/properties';

import { ControlBlock } from './control.block';

type Props = {
  property?: Property;
  label?: string;
  handle?: string;
  required?: boolean;
  instructions?: string;
  width?: number;
  disabled?: boolean;
  errors?: string[];
  context?: unknown;
  preContent?: React.ReactNode;
};

export const Control: React.FC<PropsWithChildren<Props>> = ({
  children,
  property,
  label,
  handle,
  required,
  instructions,
  width,
  disabled,
  errors,
  context,
  preContent,
}) => {
  const { hasTranslation, removeTranslation, isTranslationsEnabled } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTranslations(context as any);

  const { edition, translatable, messages } = property || {};

  return (
    <ControlBlock
      edition={edition}
      label={property?.label || label}
      handle={property?.handle || handle}
      required={property?.required || required}
      instructions={property?.instructions || instructions}
      width={property?.width || width}
      disabled={property?.disabled || disabled}
      errors={errors}
      messages={messages}
      translatable={isTranslationsEnabled && translatable}
      hasTranslation={hasTranslation(handle)}
      isEncrypted={property?.flags?.includes('encrypted')}
      removeTranslation={() => removeTranslation(handle)}
      preContent={preContent}
    >
      {children}
    </ControlBlock>
  );
};
