import React from 'react';
import type { Form } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';

import { Card } from './card/card';
import { chartDataset } from './list.empty.datasets';
import { MutedWrapper } from './list.empty.styles';

const color = '#e0e0e0';
const generateFormData = (name: string, description: string): Form => ({
  name,
  handle: '',
  settings: {
    general: {
      description,
      color,
    },
  },
  type: '',
  uid: '',
});

export const EmptyList: React.FC = () => {
  return (
    <>
      <p>
        {translate(
          `You don't have any forms yet. Create your first form now...`
        )}
      </p>

      <button className="btn submit add icon">{translate('New Form')}</button>

      <MutedWrapper>
        <Card
          form={generateFormData('Contact Form', 'Main contact form.')}
          counters={{
            submissions: 14,
            spam: 5,
          }}
          chartDataset={chartDataset[0]}
        />
        <Card
          form={generateFormData(
            'Customer Survey',
            'Customer satisfaction survey.'
          )}
          counters={{
            submissions: 72,
            spam: 18,
          }}
          chartDataset={chartDataset[1]}
        />
        <Card
          form={generateFormData('Newsletter', 'Newsletter signup form.')}
          counters={{
            submissions: 138,
            spam: 7,
          }}
          chartDataset={chartDataset[2]}
        />
      </MutedWrapper>
    </>
  );
};
