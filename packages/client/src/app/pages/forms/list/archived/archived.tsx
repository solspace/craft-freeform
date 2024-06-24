import React, { useState } from 'react';
import type { FormWithStats } from '@ff-client/queries/forms';
import translate from '@ff-client/utils/translations';

import { ArchivedItem } from '../archived-item/archived-item';

import { ArchivedItems, Button, Wrapper } from './archived.styles';

type Props = {
  data: FormWithStats[];
};

export const Archived: React.FC<Props> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = (): void => setIsVisible(!isVisible);

  const archived =
    data && data.filter(({ dateArchived }) => dateArchived !== null);
  const isEmpty = (data && !archived.length) ?? true;

  if (isEmpty) {
    return null;
  }

  return (
    <Wrapper>
      <Button onClick={toggleVisibility}>
        {translate(isVisible ? 'Hide archived forms' : 'Show archived forms')}
      </Button>
      {isVisible && (
        <ArchivedItems>
          {archived.map((form) => (
            <ArchivedItem key={form.id} form={form} />
          ))}
        </ArchivedItems>
      )}
    </Wrapper>
  );
};
