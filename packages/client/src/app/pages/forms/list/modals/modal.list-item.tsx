import React, { useRef } from 'react';
import { useHover } from '@ff-client/hooks/use-hover';
import type { FormWithStats } from '@ff-client/types/forms';
import CrossIcon from '@ff-icons/actions/delete.svg';

import {
  FormDetails,
  Name,
  PaddedFooter,
  Remove,
  Wrapper,
} from './modal.list-item.styles';

type Props = {
  form: FormWithStats;
};

export const FormItem: React.FC<Props> = ({ form }) => {
  const formItemRef = useRef<HTMLDivElement>(null);
  const hovering = useHover(formItemRef);

  const { id, name, settings } = form;
  const { color } = settings.general;

  return (
    <Wrapper data-id={id} ref={formItemRef}>
      <FormDetails>
        <Name>{name}</Name>
      </FormDetails>
      {hovering && (
        <Remove className="remove form-item-remove">
          <CrossIcon />
        </Remove>
      )}

      <PaddedFooter $color={color} />
    </Wrapper>
  );
};
