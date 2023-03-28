import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { ThemedSkeleton } from '@ff-client/app/components/skeletons/themed-skeleton';

import { LabelWrapper, NotificationItemWrapper, Wrapper } from './type.styles';

export const CategorySkeleton: React.FC = () => {
  return (
    <ThemedSkeleton>
      <Wrapper>
        <LabelWrapper>
          <Skeleton width={50} />
        </LabelWrapper>
        <NotificationItemWrapper style={{ padding: 14 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <Skeleton width={20} height={20} circle />
              <div style={{ flexGrow: 2 }}>
                <Skeleton width={100} style={{ top: 2 }} />
              </div>
              <Skeleton width={10} height={10} circle style={{ top: 6 }} />
            </div>
          ))}
        </NotificationItemWrapper>
      </Wrapper>
    </ThemedSkeleton>
  );
};
