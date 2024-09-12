import React, { useState } from 'react';
import type { FormWithStats } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';

import { ArchivedItem } from './archived.item';
import { ArchivedItems, Button, Wrapper } from './archived.styles';

type Props = {
  data: FormWithStats[];
};

export const Archived: React.FC<Props> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  if (!data?.length) {
    return null;
  }

  return (
    <Wrapper>
      <Button onClick={() => setIsVisible(!isVisible)}>
        {translate(isVisible ? 'Hide archived forms' : 'Show archived forms')}
      </Button>
      {isVisible && (
        <ArchivedItems>
          {data.map((form) => (
            <ArchivedItem key={form.id} form={form} />
          ))}
        </ArchivedItems>
      )}
    </Wrapper>
  );
};
