import React from 'react';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import {
  Label,
  LabelText,
  RequiredStar,
  TranslateIconWrapper,
} from './label.styles';
import TranslateIcon from './translate.icon.svg';

type Props = {
  label: string;
  handle: string;
  required?: boolean;
  translatable?: boolean;
};

const FormLabel: React.FC<Props> = ({
  label,
  handle,
  required,
  translatable,
}) => {
  const { current: currentSite } = useSiteContext();

  if (!label) {
    return null;
  }

  return (
    <Label className={classes(required && 'is-required')} htmlFor={handle}>
      <LabelText>{translate(label)}</LabelText>
      {required && <RequiredStar />}
      {translatable && (
        <TranslateIconWrapper
          className={classes(currentSite?.primary && 'primary')}
        >
          <TranslateIcon />
        </TranslateIconWrapper>
      )}
    </Label>
  );
};

export default FormLabel;
