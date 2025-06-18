import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { ControlBlock } from '@components/form-controls/control.block';
import translate from '@ff-client/utils/translations';
import axios from 'axios';
import styled from 'styled-components';

import type { InputControl } from '../template.modal.types';

type Asset = {
  id: number;
  title: string;
  thumbUrl: string;
  editUrl: string;
  url: string;
  size: string;
  kind: string;
  dateModified: string;
};

export const AssetsInput: FC<InputControl> = (props) => {
  const { value, onChange } = props;

  const [loadedAssets, setLoadedAssets] = useState<Asset[]>([]);

  // Fetch asset data when IDs change
  useEffect(() => {
    const fetchAssets = async (ids: number[]): Promise<Asset[]> => {
      if (ids.length === 0) {
        return [];
      }

      const response = await axios.get(`api/assets?ids=${ids.join(',')}`);

      return response.data as Asset[];
    };

    if (value.length) {
      fetchAssets(value).then((assets) => setLoadedAssets(assets));
    } else {
      setLoadedAssets([]);
    }
  }, [value]);

  const openModal = useCallback((): void => {
    Craft.createElementSelectorModal('craft\\elements\\Asset', {
      multiSelect: true,
      sources: '*',
      criteria: { kind: [], siteId: 1 },
      storageKey: 'freeform-asset-selection',
      onSelect: (elements) => {
        // Format selected assets
        const selectedIds = elements.map((element) => element.id);
        const uniqueSelectedIds = Array.from(
          new Set([...value, ...selectedIds])
        );

        onChange(uniqueSelectedIds);
      },
    });
  }, [onChange]);

  const removeAsset = useCallback(
    (assetId: number): void => {
      onChange(value.filter((id: number) => id !== assetId));
    },
    [onChange, value]
  );

  return (
    <ControlBlock {...props}>
      <div>
        <div className="elementselect">
          <ul className="elements chips chips-small">
            {loadedAssets.map((asset) => (
              <li key={asset.id} className="element small removable">
                <div className="chip small element removable">
                  <div className="thumb">
                    <img
                      src={asset.thumbUrl}
                      alt={asset.title}
                      width={30}
                      height={20}
                    />
                  </div>

                  <div className="chip-content">
                    <div className="element-label">
                      <a className="label-link" href={asset.editUrl}>
                        {asset.title}
                      </a>
                    </div>

                    <div className="chip-actions">
                      <Button
                        type="button"
                        title="Remove"
                        onClick={() => removeAsset(asset.id)}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex">
            <button type="button" className="btn add icon" onClick={openModal}>
              {translate('Add an asset')}
            </button>
          </div>
        </div>
      </div>
    </ControlBlock>
  );
};

const Button = styled.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`;
