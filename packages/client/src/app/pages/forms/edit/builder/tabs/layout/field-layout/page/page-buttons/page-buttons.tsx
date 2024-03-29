import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { Page, PageButton } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { contextActions, FocusType } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import classes from '@ff-client/utils/classes';

import { PageFieldLayoutWrapper } from '../../layout/layout.styles';

import { ButtonGroup, ButtonGroupWrapper } from './page-buttons.styles';

type Props = {
  page: Page;
};

const buttonClasses: Record<string, string> = {
  back: 'btn',
  save: 'btn',
  submit: 'btn submit',
};

export const PageButtons: React.FC<Props> = ({ page }) => {
  const dispatch = useAppDispatch();

  const {
    active,
    type: contextType,
    uid: contextUid,
  } = useSelector(contextSelectors.focus);

  const isActive = useMemo(() => {
    return active && contextType === FocusType.Page && contextUid === page.uid;
  }, [active, contextType, contextUid, page.uid]);

  const layout = page.buttons?.layout || 'save back|submit';
  const groups = layout.split(' ');

  const buttonGroups: Array<Array<PageButton>> = [];
  groups.forEach((group) => {
    const buttons = group.split('|');
    const buttonGroup: PageButton[] = [];
    buttons.forEach((buttonHandle) => {
      if (buttonHandle === 'back' && page.order === 0) {
        return;
      }

      switch (buttonHandle) {
        case 'submit':
          buttonGroup.push({
            handle: 'submit',
            label: page.buttons.submitLabel,
            enabled: true,
          });
          break;

        case 'back':
          page.buttons.back &&
            buttonGroup.push({
              handle: 'back',
              label: page.buttons.backLabel,
              enabled: page.buttons.back,
            });
          break;

        case 'save':
          page.buttons.save &&
            buttonGroup.push({
              handle: 'save',
              label: page.buttons.saveLabel,
              enabled: page.buttons.save,
            });
          break;

        default:
          return;
      }
    });

    buttonGroups.push(buttonGroup);
  });

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
            {group.map((button, index) => (
              <button
                className={buttonClasses[button?.handle]}
                key={index}
                type="button"
              >
                {button.label}
              </button>
            ))}
          </ButtonGroup>
        ))}
      </ButtonGroupWrapper>
    </PageFieldLayoutWrapper>
  );
};
