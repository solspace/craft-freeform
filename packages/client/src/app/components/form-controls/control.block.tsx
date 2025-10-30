import type { PropsWithChildren } from 'react';
import React from 'react';
import {
  ControlWrapper,
  ExtraContent,
  FormField,
  LabelGroup,
  LabelInstructionsWrapper,
} from '@components/form-controls/control.styles';
import FormInstructions from '@components/form-controls/instructions';
import FormLabel from '@components/form-controls/label';
import { Edition } from '@config/freeform/freeform.config';
import config from '@config/freeform/freeform.config';
import type { Message } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { capitalize } from 'lodash';

import { FormErrorList } from './error-list';
import { FormMessageList } from './message-list';

export type ControlProps = {
  edition?: Edition;
  label?: string;
  handle?: string;
  required?: boolean;
  instructions?: string;
  translatable?: boolean;
  hasTranslation?: boolean;
  isEncrypted?: boolean;
  removeTranslation?: () => void;
  width?: number;
  disabled?: boolean;
  errors?: string[];
  messages?: Message[];
  preContent?: React.ReactNode;
  extraContent?: React.ReactNode;
};

export const ControlBlock: React.FC<PropsWithChildren<ControlProps>> = ({
  edition,
  label,
  handle,
  required,
  instructions,
  translatable,
  hasTranslation,
  removeTranslation,
  width,
  disabled,
  children,
  errors,
  messages,
  isEncrypted,
  preContent,
  extraContent,
}) => {
  const {
    editions: { isAtLeast },
  } = config;
  const upsell =
    edition !== Edition.Express && !isAtLeast(edition || Edition.Express);

  return (
    <ControlWrapper
      className={classes(
        !!errors && 'errors',
        disabled && 'disabled',
        upsell && 'upsell'
      )}
      data-upsell={translate('Upgrade to {edition} to unlock this field.', {
        edition: capitalize(edition),
      })}
      $width={width}
    >
      <LabelGroup>
        {preContent !== undefined && <ExtraContent>{preContent}</ExtraContent>}

        <LabelInstructionsWrapper>
          <FormLabel
            label={label}
            handle={handle}
            required={required}
            translatable={translatable}
            hasTranslation={hasTranslation}
            isEncrypted={isEncrypted}
            removeTranslation={removeTranslation}
          />
          <FormInstructions instructions={instructions} />
        </LabelInstructionsWrapper>

        {extraContent !== undefined && (
          <ExtraContent>{extraContent}</ExtraContent>
        )}
      </LabelGroup>

      <FormField>{children}</FormField>
      <FormErrorList errors={errors} />
      <FormMessageList messages={messages} />
    </ControlWrapper>
  );
};
