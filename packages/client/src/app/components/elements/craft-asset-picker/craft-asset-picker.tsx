import type { FC } from 'react';
import React, { useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import type { GenericValue } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import styled from 'styled-components';

import { useAssetPreviewQuery } from './craft-asset-picker.queries';

type Props = {
  actionLabel?: string;
  multiSelect?: boolean;
  sources?: string[] | string;
  criteria?: Record<string, GenericValue>;
  value: number[];
  onUpdate: (value: number[]) => void;
};

export const CraftAssetPicker: FC<Props> = ({
  actionLabel,
  multiSelect,
  sources = '*',
  criteria,
  value,
  onUpdate,
}) => {
  const { data, isFetching } = useAssetPreviewQuery(value);

  const openModal = useCallback((): void => {
    Craft.createElementSelectorModal('craft\\elements\\Asset', {
      multiSelect,
      sources,
      criteria,
      storageKey: 'freeform-asset-selection',
      onSelect: (elements) => {
        // Format selected assets
        const selectedIds = elements.map((element) => element.id);
        const newIds = selectedIds.filter((id) => !value.includes(id));
        const combinedIds = [...value, ...newIds];

        onUpdate(combinedIds);
      },
    });
  }, [onUpdate, multiSelect, criteria]);

  const removeAsset = useCallback(
    (assetId: number): void => {
      onUpdate(value.filter((id: number) => id !== assetId));
    },
    [onUpdate, value]
  );

  const showLoading = data === undefined && isFetching && value.length > 0;

  return (
    <div className="elementselect">
      <ul className="elements chips chips-small">
        {showLoading &&
          value.map((id, idx) => (
            <li key={`skeleton-${id}`} className="element small">
              <div className="chip small element">
                <div className="thumb">
                  <Skeleton width={30} height={20} />
                </div>

                <div className="chip-content">
                  <Skeleton width={getSkeletonWidth(idx)} />
                </div>
              </div>
            </li>
          ))}

        {data !== undefined &&
          data.map((asset) => (
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
          {translate(actionLabel || 'Add an asset')}
        </button>
      </div>
    </div>
  );
};

const widthMap = [80, 100, 90, 70, 120];

const getSkeletonWidth = (index: number): number => {
  return widthMap[index] || 100;
};

const Button = styled.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`;
