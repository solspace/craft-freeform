import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const FormModalLoading: React.FC = () => {
  return (
    <>
      <div>
        <Skeleton height={10} width={50} />
        <Skeleton height={24} />
      </div>
      <div>
        <Skeleton height={10} width={150} />
        <Skeleton height={24} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Skeleton height={24} width={38} borderRadius={12} />
        <div style={{ flex: 1 }}>
          <Skeleton height={10} width={80} />
          <Skeleton height={8} width="60%" />
        </div>
      </div>
    </>
  );
};
