import React from 'react';
import type { FormWithStats } from '@ff-client/queries/forms';
import translate from '@ff-client/utils/translations';

import { Card } from './card/card';
import { chartDataset } from './list.empty.datasets';
import { MutedWrapper } from './list.empty.styles';

const color = '#e0e0e0';
const generateFormData = (
  name: string,
  description: string,
  chartData: Array<{ uv: number }>,
  submissions: number,
  spam: number
): FormWithStats => ({
  uid: '',
  type: '',
  name,
  handle: '',
  chartData,
  counters: {
    submissions,
    spam,
  },
  settings: {
    general: {
      description,
      color,
    },
  },
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
          form={generateFormData(
            'Contact Form',
            'Main contact form.',
            chartDataset[0],
            14,
            5
          )}
        />
        <Card
          form={generateFormData(
            'Customer Survey',
            'Customer satisfaction survey.',
            chartDataset[1],
            72,
            18
          )}
        />
        <Card
          form={generateFormData(
            'Newsletter',
            'Newsletter signup form.',
            chartDataset[2],
            138,
            7
          )}
        />
      </MutedWrapper>
    </>
  );
};
