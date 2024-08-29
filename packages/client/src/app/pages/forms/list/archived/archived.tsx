import React, { useState } from 'react';
import type { FormWithStats } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';

import { ArchivedItem } from '../archived-item/archived-item';

import { ArchivedItems, Button, Wrapper } from './archived.styles';

type Props = {
  data: FormWithStats[];
  isProEdition?: boolean;
};

export const Archived: React.FC<Props> = ({ data, isProEdition = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = (): void => setIsVisible(!isVisible);

  const isEmpty = (data && !data.length) ?? true;

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
          {data &&
            data.map((form) => (
              <ArchivedItem
                isProEdition={isProEdition}
                key={form.id}
                form={form}
              />
            ))}
        </ArchivedItems>
      )}
    </Wrapper>
  );
};
