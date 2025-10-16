import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { contextActions, FocusType } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import SpinnerIcon from '@ff-client/assets/icons/spinner.icon.svg';
import { useAssetQuery } from '@ff-client/queries/assets';
import classes from '@ff-client/utils/classes';

import { PageFieldLayoutWrapper } from '../../layout/layout.styles';

import { getButtonGroups } from './page-buttons.operations';
import { Button, ButtonGroup, ButtonGroupWrapper } from './page-buttons.styles';

type Props = {
  page: Page;
};

const buttonClasses: Record<string, string> = {
  back: 'btn',
  save: 'btn',
  submit: 'btn btn-submit',
};

export const PageButtons: React.FC<Props> = ({ page }) => {
  const dispatch = useAppDispatch();
  const { getTranslation } = useTranslations(page);

  const {
    active,
    type: contextType,
    uid: contextUid,
  } = useSelector(contextSelectors.focus);

  const isActive = useMemo(() => {
    return active && contextType === FocusType.Page && contextUid === page.uid;
  }, [active, contextType, contextUid, page.uid]);

  const buttonGroups = getButtonGroups(page);

  const assetIds = buttonGroups
    .flat()
    .map((button) => button.assetId)
    .filter(Boolean);

  const { data: assetPreviews, isFetching } = useAssetQuery(assetIds, '');

  const getIcon = useCallback(
    (assetId: number) => {
      const url = assetPreviews?.[assetId]?.src;
      if (isFetching) {
        return <SpinnerIcon />;
      }

      return <img src={url} />;
    },
    [assetPreviews, isFetching]
  );

  return (
    <PageFieldLayoutWrapper>
      <ButtonGroupWrapper
        className={classes(isActive && 'active')}
        onClick={() => {
          dispatch(
            contextActions.setFocusedItem({
              type: FocusType.Page,
              uid: page.uid,
            })
          );
        }}
      >
        {buttonGroups.map((group, index) => (
          <ButtonGroup key={index} className="page-buttons">
            {group.map(({ handle, label, iconPosition, assetId }, index) => (
              <Button
                className={buttonClasses[handle]}
                key={index}
                type="button"
              >
                {assetId && iconPosition === 'left' && getIcon(assetId)}
                {getTranslation(`${handle}Label`, label)}
                {assetId && iconPosition === 'right' && getIcon(assetId)}
              </Button>
            ))}
          </ButtonGroup>
        ))}
      </ButtonGroupWrapper>
    </PageFieldLayoutWrapper>
  );
};
