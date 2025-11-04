import type { PropsWithChildren } from 'react';
import React from 'react';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import type { Property } from '@ff-client/types/properties';

import { ControlBlock } from './control.block';

type Props = {
  property: Property;
  errors?: string[];
  context?: unknown;
  preContent?: React.ReactNode;
};

export const Control: React.FC<PropsWithChildren<Props>> = ({
  children,
  property,
  errors,
  context,
  preContent,
}) => {
  const { hasTranslation, removeTranslation, isTranslationsEnabled } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTranslations(context as any);

  const {
    edition,
    label,
    handle,
    required,
    instructions,
    width,
    disabled,
    translatable,
    messages,
  } = property;

  return (
    <ControlBlock
      edition={edition}
      label={label}
      handle={handle}
      required={required}
      instructions={instructions}
      width={width}
      disabled={disabled}
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
