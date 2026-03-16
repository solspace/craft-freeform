import type { FC } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import CheckIcon from '@ff-icons/actions/checkmark.svg';
import { isPast } from 'date-fns';

import { formatRate, lineColors } from './ab-tests.operations';
import {
  VariantCard,
  VariantCardWrapper,
  VariantFooter,
  VariantHeader,
  VariantLetter,
  VariantStats,
  Winner,
} from './ab-tests.styles';
import type {
  ABTestDashboardItem,
  ABTestDashboardVariant,
} from './ab-tests.types';

type Props = {
  variant: ABTestDashboardVariant;
  test: ABTestDashboardItem;
};

export const ABTestCard: FC<Props> = ({ variant, test }) => {
  const isWinner = variant.id === test.winnerVariantId;
  const isInPast = test.endDate && isPast(test.endDate);

  return (
    <VariantCardWrapper key={variant.id}>
      {isWinner && (
        <Winner>
          <div>
            <CheckIcon /> {translate(isInPast ? 'Winner' : 'Winning')}
          </div>
        </Winner>
      )}

      <VariantCard className={classes(isWinner && 'winner')}>
        <VariantHeader>
          <VariantLetter
            style={{
              backgroundColor:
                lineColors[test.variants.indexOf(variant) % lineColors.length],
            }}
          >
            {String.fromCharCode(65 + test.variants.indexOf(variant))}
          </VariantLetter>

          {variant.formName}
        </VariantHeader>

        <VariantStats>
          <span>{translate('Weight')}</span>
          <strong>{variant.weight}%</strong>
          <span>{translate('Impressions')}</span>
          <strong>{variant.stats.served.toLocaleString()}</strong>
          <span>{translate('Interactions')}</span>
          <strong>{variant.stats.interacted.toLocaleString()}</strong>
          <span>{translate('Failures')}</span>
          <strong>{variant.stats.failed.toLocaleString()}</strong>
          <span>{translate('Conversions')}</span>
          <strong>{variant.stats.completed.toLocaleString()}</strong>
        </VariantStats>
        <VariantFooter>
          <span>{translate('Conversion Rate')}</span>
          <span className="thick">
            {formatRate(variant.stats.conversionRate)}
          </span>
        </VariantFooter>
      </VariantCard>
    </VariantCardWrapper>
  );
};
