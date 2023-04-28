import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { ThemedSkeleton } from '@components/loaders/skeletons/themed-skeleton';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';

import { LoadingRow } from './mini-map.styles';

export const MiniMapSkeleton: React.FC = () => {
  const layout = useSelector(layoutSelectors.cartographed.fullLayoutList);

  return (
    <ThemedSkeleton>
      {layout.map((page, idx) => (
        <div key={idx}>
          <div style={{ marginBottom: 14 }}>
            <Skeleton width="100%" height={30} />
          </div>

          {page.map((row, rowIdx) => (
            <LoadingRow key={rowIdx} style={{ display: 'flex' }}>
              {row.map((field, fieldIdx) => (
                <Skeleton key={fieldIdx} width="100%" height={28} />
              ))}
            </LoadingRow>
          ))}
        </div>
      ))}
    </ThemedSkeleton>
  );
};
