import type { FC } from 'react';
import React from 'react';

export type Address = {
  address: string;
  name: string;
  encodedAddress: string;
  encodedName: string;
  unicodeLocalpart: boolean;
};

type Props = {
  address: Address | Address[];
};

export const Address: FC<Props> = ({ address }) => {
  if (!Array.isArray(address)) {
    address = [address];
  }

  return (
    <div>
      {address.map((addr, index) => (
        <span key={index}>
          <AddressItem {...addr} />
          {index < address.length - 1 && <span>, </span>}
        </span>
      ))}
    </div>
  );
};

const AddressItem: FC<Address> = ({ address, name }) => {
  if (name) {
    return (
      <span>
        {name} &lt;{address}&gt;
      </span>
    );
  }

  return <span>{address}</span>;
};
